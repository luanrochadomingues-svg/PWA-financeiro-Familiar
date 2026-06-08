import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  setDoc,
  updateDoc,
  serverTimestamp, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { Movement, BusinessMovement, HouseholdMember } from "@/lib/models";

/**
 * Cria um novo Household em 3 etapas sequenciais para garantir 
 * que as regras de segurança do Firestore sejam aplicadas corretamente.
 */
export const createHousehold = async (userId: string, name: string, userEmail: string, userName: string) => {
  const householdRef = doc(collection(db, "households"));
  const householdId = householdRef.id;

  // ETAPA 1: Criar o documento do Household
  // Permissão: allow create se createdBy == auth.uid
  await setDoc(householdRef, {
    id: householdId,
    name,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ETAPA 2: Criar o registro de membro e atualizar o perfil do usuário
  // Permissão: allow write em members/{uid} se uid == auth.uid
  const batch1 = writeBatch(db);
  
  const memberData: HouseholdMember = {
    userId,
    role: 'owner',
    displayName: userName,
    email: userEmail,
    joinedAt: serverTimestamp(),
  };

  batch1.set(doc(db, "households", householdId, "members", userId), memberData);
  batch1.update(doc(db, "users", userId), { 
    currentHouseholdId: householdId,
    updatedAt: serverTimestamp() 
  });

  await batch1.commit();

  // ETAPA 3: Criar categorias padrão
  // Permissão: allow write se isHouseholdMember(householdId)
  // Agora que o passo 2 foi commitado, o usuário já é reconhecido como membro.
  const batch2 = writeBatch(db);
  const defaults = [
    { name: 'Salário', type: 'personal_income' },
    { name: 'Alimentação', type: 'personal_expense' },
    { name: 'Moradia', type: 'personal_expense' },
    { name: 'Transporte', type: 'personal_expense' },
    { name: 'Saúde', type: 'personal_expense' },
    { name: 'Lazer', type: 'personal_expense' },
    { name: 'Honorários', type: 'business_income' },
    { name: 'Consultas', type: 'business_income' },
    { name: 'Aluguel Escritório', type: 'business_expense' },
    { name: 'Marketing', type: 'business_expense' },
    { name: 'Internet', type: 'business_expense' }
  ];

  defaults.forEach(cat => {
    const catDoc = doc(collection(db, "households", householdId, "categories"));
    batch2.set(catDoc, { ...cat, id: catDoc.id });
  });

  await batch2.commit();
  
  return householdId;
};

export const getHouseholdMembers = async (householdId: string) => {
  const q = collection(db, "households", householdId, "members");
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as HouseholdMember);
};

export const addPersonalMovement = async (householdId: string, movement: Omit<Movement, 'id' | 'createdAt' | 'updatedAt'>) => {
  const ref = collection(db, "households", householdId, "personalMovements");
  return await addDoc(ref, {
    ...movement,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const addBusinessMovement = async (householdId: string, movement: Omit<BusinessMovement, 'id' | 'createdAt' | 'updatedAt'>) => {
  const ref = collection(db, "households", householdId, "businessMovements");
  return await addDoc(ref, {
    ...movement,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const createProLabore = async (householdId: string, data: {
  amount: number,
  date: string,
  userId: string,
  userName: string,
  description: string,
  notes: string
}) => {
  const batch = writeBatch(db);
  const transferId = doc(collection(db, "households", householdId, "transfers")).id;

  const businessRef = doc(collection(db, "households", householdId, "businessMovements"));
  const personalRef = doc(collection(db, "households", householdId, "personalMovements"));

  batch.set(businessRef, {
    householdId,
    businessId: 'main',
    date: data.date,
    type: 'expense',
    categoryId: 'pro-labore',
    categoryName: 'Retirada Pró-labore',
    description: `Pró-labore para ${data.userName}: ${data.description}`,
    amount: data.amount,
    transferId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(personalRef, {
    householdId,
    ownerUserId: data.userId,
    date: data.date,
    type: 'income',
    categoryId: 'pro-labore',
    categoryName: 'Retirada Pró-labore',
    description: `Recebimento Pró-labore Escritório: ${data.description}`,
    amount: data.amount,
    transferId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(db, "households", householdId, "transfers", transferId), {
    id: transferId,
    householdId,
    ownerUserId: data.userId,
    businessId: 'main',
    date: data.date,
    amount: data.amount,
    personalMovementId: personalRef.id,
    businessMovementId: businessRef.id,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
};

export const getMovements = async (householdId: string, type: 'personal' | 'business', userId?: string) => {
  const collectionName = type === 'personal' ? 'personalMovements' : 'businessMovements';
  const movementsRef = collection(db, "households", householdId, collectionName);
  
  let q = query(movementsRef, orderBy("date", "desc"));

  if (userId && type === 'personal') {
    q = query(q, where("ownerUserId", "==", userId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Movement);
};

export const deleteMovement = async (householdId: string, type: 'personal' | 'business', movementId: string) => {
  const collectionName = type === 'personal' ? 'personalMovements' : 'businessMovements';
  await deleteDoc(doc(db, "households", householdId, collectionName, movementId));
};
