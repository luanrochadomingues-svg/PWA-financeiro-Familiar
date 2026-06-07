import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  updateDoc,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { Household, Movement, BusinessMovement, HouseholdMember } from "@/lib/models";

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
  batch.set(householdRef, householdData);
  batch.set(doc(db, "households", householdId, "members", userId), memberData);
  batch.update(doc(db, "users", userId), { currentHouseholdId: householdId });

  // Create default categories
  const categoriesRef = collection(db, "households", householdId, "categories");
  const defaults = [
    { name: 'Salário', type: 'personal_income' },
    { name: 'Retirada Pró-labore', type: 'personal_income' },
    { name: 'Outras Receitas', type: 'personal_income' },
    { name: 'Alimentação', type: 'personal_expense' },
    { name: 'Moradia', type: 'personal_expense' },
    { name: 'Transporte', type: 'personal_expense' },
    { name: 'Saúde', type: 'personal_expense' },
    { name: 'Lazer', type: 'personal_expense' },
    { name: 'Outras Despesas', type: 'personal_expense' },
    { name: 'Honorários Advocatícios', type: 'business_income' },
    { name: 'Honorários de Êxito', type: 'business_income' },
    { name: 'Consultas', type: 'business_income' },
    { name: 'Parcela Recebida', type: 'business_income' },
    { name: 'Outras Receitas Escritório', type: 'business_income' },
    { name: 'Aluguel Escritório', type: 'business_expense' },
    { name: 'Internet', type: 'business_expense' },
    { name: 'Marketing', type: 'business_expense' },
    { name: 'Sistemas Jurídicos', type: 'business_expense' },
    { name: 'Contabilidade', type: 'business_expense' },
    { name: 'Materiais de Escritório', type: 'business_expense' },
    { name: 'Retirada Pró-labore', type: 'business_expense' },
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
    id: businessRef.id,
    householdId,
    businessId: 'main', // Default business for MVP
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
    id: personalRef.id,
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
  let q = query(
    collection(db, "households", householdId, collectionName),
    orderBy("date", "desc")
  );

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