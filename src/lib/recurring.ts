import { supabase } from './supabase';
import { CreateRecurringTransaction, RecurringTransaction, UpdateRecurringTransaction } from '../types/recurring';

// Fetch all recurring transactions for the current user
export async function fetchRecurringTransactions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RecurringTransaction[];
}

// Create a new recurring transaction
export async function createRecurringTransaction(transaction: CreateRecurringTransaction) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
            ...transaction,
            user_id: user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data as RecurringTransaction;
}

// Update an existing recurring transaction
export async function updateRecurringTransaction({ id, ...updates }: UpdateRecurringTransaction) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data as RecurringTransaction;
}

// Delete a recurring transaction
export async function deleteRecurringTransaction(id: string) {
    // First, remove the recurring_id reference from any income sources
    const { error: updateError } = await supabase
        .from('income_sources')
        .update({ recurring_id: null, is_recurring: false })
        .eq('recurring_id', id);

    if (updateError) {
        console.error('Error updating income sources:', updateError);
        throw updateError;
    }

    // Then, remove the recurring_id reference from any expenses
    const { error: updateExpenseError } = await supabase
        .from('expenses')
        .update({ recurring_id: null, is_recurring: false })
        .eq('recurring_id', id);

    if (updateExpenseError) {
        console.error('Error updating expenses:', updateExpenseError);
        throw updateExpenseError;
    }

    // Finally, delete the recurring transaction
    const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting recurring transaction:', error);
        throw error;
    }
}

// Toggle the active status of a recurring transaction
export async function toggleRecurringTransactionActive(id: string, active: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('recurring_transactions')
        .update({ active })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data as RecurringTransaction;
}

// Process recurring transactions for the current month
export async function processMonthlyRecurringTransactions() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 1. Get all active recurring transactions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recurringTransactions, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true);

    if (fetchError) throw fetchError;
    
    console.log('Found recurring transactions:', recurringTransactions); // Debug log

    // 2. Split into income and expenses
    const recurringIncome = recurringTransactions.filter(t => t.type === 'income');
    const recurringExpenses = recurringTransactions.filter(t => t.type === 'expense');

    // 3. Check existing income for this month
    const { data: existingIncome, error: incomeCheckError } = await supabase
        .from('income_sources')
        .select('recurring_id')
        .eq('is_recurring', true)
        .gte('created_at', firstDayOfMonth.toISOString());

    if (incomeCheckError) throw incomeCheckError;

    // 4. Check existing expenses for this month
    const { data: existingExpenses, error: expenseCheckError } = await supabase
        .from('expenses')
        .select('recurring_id')
        .eq('is_recurring', true)
        .gte('created_at', firstDayOfMonth.toISOString());

    if (expenseCheckError) throw expenseCheckError;

    // 5. Filter out already processed transactions
    const processedIncomeIds = existingIncome.map(t => t.recurring_id);
    const processedExpenseIds = existingExpenses.map(t => t.recurring_id);

    const unprocessedIncome = recurringIncome.filter(
        r => !processedIncomeIds.includes(r.id)
    );
    const unprocessedExpenses = recurringExpenses.filter(
        r => !processedExpenseIds.includes(r.id)
    );

    // 6. Create new income entries
    if (unprocessedIncome.length > 0) {
        console.log('Processing income:', unprocessedIncome);
        const { error: insertIncomeError } = await supabase
            .from('income_sources')
            .insert(
                unprocessedIncome.map(recurring => ({
                    name: recurring.name,
                    amount: recurring.amount,
                    is_recurring: true,
                    recurring_id: recurring.id,
                    user_id: user.id,
                    date: firstDayOfMonth.toISOString(),
                    created_at: new Date().toISOString()
                }))
            );

        if (insertIncomeError) {
            console.error('Error inserting income:', insertIncomeError);
            throw insertIncomeError;
        }
    }

    // 7. Create new expense entries
    if (unprocessedExpenses.length > 0) {
        console.log('Processing expenses:', unprocessedExpenses);
        const { error: insertExpenseError } = await supabase
            .from('expenses')
            .insert(
                unprocessedExpenses.map(recurring => ({
                    name: recurring.name,
                    amount: recurring.amount,
                    category: recurring.category,
                    is_recurring: true,
                    recurring_id: recurring.id,
                    user_id: user.id,
                    date: firstDayOfMonth.toISOString(),
                    created_at: new Date().toISOString()
                }))
            );

        if (insertExpenseError) {
            console.error('Error inserting expenses:', insertExpenseError);
            throw insertExpenseError;
        }
    }
}
