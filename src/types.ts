export type Category = 'investment' | 'debt' | 'needs' | 'leisure';

export interface Income {
    source: string;
    amount: number;
}

export interface Expense {
    id: string;
    name: string;
    amount: number;
    category: Category;
    date: Date;
}

export interface MonthData {
    month: Date;
    incomes: Income[];
    expenses: Expense[];
}
