export interface Expense {
    id: string;
    created_at: string;
    name: string;
    amount: number;
    category: Category;
    user_id: string;
    date: string;
    goal_id?: string;
    is_recurring?: boolean;
    recurring_id?: string;
}

async create(expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) {
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            ...expense,
            user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

async update(id: string, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'user_id'>>) {
    const { data, error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
} 