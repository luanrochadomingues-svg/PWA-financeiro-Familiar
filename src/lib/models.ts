export interface User {
  uid: string;
  displayName: string;
  email: string;
  createdAt: any;
  updatedAt: any;
  currentHouseholdId?: string | null;
}

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface HouseholdMember {
  userId: string;
  role: 'owner' | 'member';
  displayName: string;
  email: string;
  joinedAt: any;
}

export interface Category {
  id: string;
  name: string;
  type: 'personal_income' | 'personal_expense' | 'business_income' | 'business_expense';
  icon?: string;
}

export interface Movement {
  id: string;
  householdId: string;
  ownerUserId: string;
  date: string; // ISO string or YYYY-MM-DD
  type: 'income' | 'expense';
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  transferId?: string; // For pro-labore links
}

export interface BusinessMovement extends Movement {
  businessId: string;
  clientName?: string;
  caseReference?: string;
}

export interface Transfer {
  id: string;
  householdId: string;
  ownerUserId: string;
  businessId: string;
  date: string;
  amount: number;
  personalMovementId: string;
  businessMovementId: string;
}
