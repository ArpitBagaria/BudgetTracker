import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          total_points: number;
          current_level: number;
          current_streak: number;
          best_streak: number;
          last_activity_date: string | null;
          monthly_budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          total_points?: number;
          current_level?: number;
          current_streak?: number;
          best_streak?: number;
          last_activity_date?: string | null;
          monthly_budget?: number | null;
        };
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      expenses: {
        Row: {
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
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          description: string | null;
          created_at: string;
        };
      };
      savings_goals: {
        Row: {
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
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          points_reward: number;
          requirement_type: string;
          requirement_value: number;
          tier: string;
          created_at: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
      };
    };
  };
};
