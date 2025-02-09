import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Income = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  date: string;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  category: string;
  name: string;
  amount: number;
  date: string;
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
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
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

    async remove(id: string) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  }
};
