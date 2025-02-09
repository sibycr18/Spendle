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
