import { Category, TransactionType } from './transaction';

export interface RecurringTransaction {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    type: TransactionType;
    category?: Category;
    active: boolean;
    created_at: string;
}

export interface CreateRecurringTransaction {
    name: string;
    amount: number;
    type: TransactionType;
    category?: Category;
    active?: boolean;
}

export interface UpdateRecurringTransaction extends Partial<CreateRecurringTransaction> {
    id: string;
}
