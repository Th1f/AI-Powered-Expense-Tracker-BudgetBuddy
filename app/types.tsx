export interface Category {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'weekly';
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
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
  custom_categories: Category[];
}