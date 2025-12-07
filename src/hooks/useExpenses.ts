import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  is_ai_categorized: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
}

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    fetchExpenses();
    fetchCategories();
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const addExpense = async (expense: {
    amount: number;
    description: string;
    category_id: string;
    date: string;
    is_ai_categorized?: boolean;
    notes?: string;
  }) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        ...expense,
      })
      .select()
      .single();

    if (!error && data) {
      setExpenses([data, ...expenses]);
    }

    return { data, error };
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const { data, error } = await supabase
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setExpenses(expenses.map(e => e.id === id ? data : e));
    }

    return { data, error };
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (!error) {
      setExpenses(expenses.filter(e => e.id !== id));
    }

    return { error };
  };

  const categorizeWithAI = async (description: string): Promise<string> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/categorize-expense`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description }),
        }
      );

      const result = await response.json();
      return result.category_id;
    } catch (error) {
      console.error('Error categorizing expense:', error);
      return categories.find(c => c.name === 'Other')?.id || categories[0]?.id || '';
    }
  };

  return {
    expenses,
    categories,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    categorizeWithAI,
    refetch: fetchExpenses,
  };
}
