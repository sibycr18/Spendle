export type Category = 'investment' | 'debt' | 'needs' | 'leisure';

export interface Income {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    date: string;
    created_at: string;
}

export interface Expense {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    category: Category;
    date: string;
    created_at: string;
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    type: 'income' | 'expense';
    category?: Category; // Optional because income doesn't have category
    active: boolean;
}

export interface MonthData {
    month: Date;
    incomes: Income[];
    expenses: Expense[];
}

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
}
