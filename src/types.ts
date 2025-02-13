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
    goal_id?: string;
    is_recurring: boolean;
    recurring_id?: string;
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
    goal_id?: string; // Optional because not all recurring transactions are linked to goals
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

export interface SavingsGoal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    monthly_contribution: number;
    category: Category;
    created_at: string;
    status: 'active' | 'completed' | 'cancelled';
}

export interface SavingsRecommendation {
    id: string;
    goal_id: string;
    type: 'spending_cut' | 'investment_opportunity' | 'saving_suggestion';
    description: string;
    potential_impact: number;
    created_at: string;
    status: 'pending' | 'accepted' | 'rejected';
}
