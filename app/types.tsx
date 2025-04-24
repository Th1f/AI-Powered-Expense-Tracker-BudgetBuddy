export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: 'food' | 'transport' | 'shopping' | 'entertainment' | 'health' | 'housing' | 'income' | 'other';
  date: Date;
  isExpense: boolean;
}

export interface UserData {
    email: string;
    name: string;
    userId: string;
    budget: number;
    used_budget: number;
    error: boolean;
}