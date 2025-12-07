import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  emoji: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useSavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const addGoal = async (goal: {
    title: string;
    target_amount: number;
    deadline?: string;
    emoji?: string;
  }) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        current_amount: 0,
        is_completed: false,
        ...goal,
      })
      .select()
      .single();

    if (!error && data) {
      setGoals([data, ...goals]);
    }

    return { data, error };
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setGoals(goals.map(g => g.id === id ? data : g));
    }

    return { data, error };
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (!error) {
      setGoals(goals.filter(g => g.id !== id));
    }

    return { error };
  };

  const addProgress = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return { data: null, error: new Error('Goal not found') };

    const newAmount = goal.current_amount + amount;
    const isCompleted = newAmount >= goal.target_amount;

    return updateGoal(id, {
      current_amount: newAmount,
      is_completed: isCompleted,
    });
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addProgress,
    refetch: fetchGoals,
  };
}
