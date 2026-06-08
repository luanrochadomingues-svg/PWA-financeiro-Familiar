
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { Movement, BusinessMovement, HouseholdMember } from "@/lib/models";

export const createHousehold = async (userId: string, name: string, userEmail: string, userName: string) => {
  const householdRef = doc(collection(db, "households"));
  const householdId = householdRef.id;

  const householdData = {
    id: householdId,
    name,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const memberData: HouseholdMember = {
    userId,
    role: 'owner',
    displayName: userName,
    email: userEmail,
    joinedAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  
  // 1. Cria o Household
  batch.set(householdRef, householdData);
  
  // 2. Cria o registro de membro para o usuário atual
  batch.set(doc(db, "households", householdId, "members", userId), memberData);
  
  // 3. Atualiza o perfil do usuário com o ID do household atual
  batch.update(doc(db, "users", userId), { 
    currentHouseholdId: householdId,
    updatedAt: serverTimestamp() 
  });

  // 4. Cria categorias padrão
  const categoriesRef = collection(db, "households", householdId, "categories");
  const defaults = [
    { name: 'Salário', type: 'personal_income' },
    { name: 'Alimentação', type: 'personal_expense' },
    { name: 'Moradia', type: 'personal_expense' },
    { name: 'Honorários', type: 'business_income' },
    { name: 'Aluguel Escritório', type: 'business_expense' }
  ];

  defaults.forEach(cat => {
    const catDoc = doc(categoriesRef);
    batch.set(catDoc, { ...cat, id: catDoc.id });
  });

  await batch.commit();
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
