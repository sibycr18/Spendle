// This file is kept for backward compatibility
// It re-exports everything from the enhanced supabaseClient

import { supabase, supabaseAuth, isOffline } from './supabaseClient';

export { supabase, supabaseAuth, isOffline };

// Types for our database tables
export type Income = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  date: string;
  created_at: string;
  is_recurring?: boolean;
  recurring_id?: string;
};

export type Expense = {
  id: string;
  user_id: string;
  category: string;
  name: string;
  amount: number;
  date: string;
  created_at: string;
  is_recurring: boolean;
  recurring_id?: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  category: string;
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
};

export type SavingsRecommendation = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  date: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export type RecurringTransaction = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  active: boolean;
  goal_id?: string;
  frequency: 'monthly';
  created_at: string;
};

// Database helper functions
export const db = {
  // Income functions
  income: {
    async getAll(userId: string, startDate: Date, endDate: Date) {
      // Convert dates to YYYY-MM format for exact month matching
      const startMonth = startDate.toISOString().slice(0, 7);
      const endMonth = endDate.toISOString().slice(0, 7);

      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', userId)
        // Use to_char to convert the date column to YYYY-MM format for comparison
        .gte("date", `${startMonth}-01`)
        .lt("date", `${endMonth}-01T23:59:59.999Z`);

      if (error) throw error;
      return data || [];
    },

    async add(income: Omit<Income, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('income_sources')
        .insert(income)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, income: Partial<Omit<Income, 'id' | 'created_at' | 'user_id'>>) {
      console.log('Attempting to update income with id:', id);
      console.log('Update data:', income);

      const { data, error } = await supabase
        .from('income_sources')
        .update(income)
        .eq('id', id)
        .select();

      console.log('Supabase response - data:', data);
      console.log('Supabase response - error:', error);

      if (error) {
        console.error('Error updating income:', error);
        throw error;
      }
      if (!data || data.length === 0) {
        console.error('No income found with id:', id);
        throw new Error('Income source not found');
      }
      console.log('Successfully updated income:', data[0]);
      return data[0];
    },

    async remove(id: string) {
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  // Expense functions
  expenses: {
    async getAll(userId: string, startDate: Date, endDate: Date) {
      // Convert dates to YYYY-MM format for exact month matching
      const startMonth = startDate.toISOString().slice(0, 7);
      const endMonth = endDate.toISOString().slice(0, 7);

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        // Use same format as income query
        .gte("date", `${startMonth}-01`)
        .lt("date", `${endMonth}-01T23:59:59.999Z`)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },

    async add(expense: Omit<Expense, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'user_id'>>) {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          is_recurring: expense.is_recurring,
          recurring_id: expense.recurring_id
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Expense not found');
      return data[0];
    },

    async remove(id: string) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  savingsGoals: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async create(goal: Omit<SavingsGoal, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{ ...goal, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<SavingsGoal>) {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async remove(id: string) {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async getExpensesTotal(goalId: string) {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('goal_id', goalId);

      if (error) throw error;
      return data.reduce((sum, expense) => sum + expense.amount, 0);
    }
  },

  recurringTransactions: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async create(transaction: Omit<RecurringTransaction, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([{ ...transaction, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Omit<RecurringTransaction, 'id' | 'created_at' | 'user_id'>>) {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async remove(id: string) {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async deactivate(id: string) {
      return this.update(id, { active: false });
    }
  }
};
