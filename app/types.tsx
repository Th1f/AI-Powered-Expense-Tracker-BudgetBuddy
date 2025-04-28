export type CategoryType = 'food' | 'transport' | 'shopping' | 'entertainment' | 'housing' | 'health' | 'other';
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: CategoryType;
  date: string;
  isExpense: boolean;
}

export interface UserData {
  email: string;
  name: string;
  userId: string;
  budget: number;
  used_budget: number;
  error: boolean;
  transactions: Transaction[];
}