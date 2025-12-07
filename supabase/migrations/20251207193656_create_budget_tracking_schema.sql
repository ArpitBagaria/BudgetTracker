/*
  # Budget Tracking App Schema
  
  ## Overview
  Complete database schema for a gamified budget tracking app targeting Gen Z users (18-21).
  Includes expense tracking, AI categorization, gamification, and rewards system.
  
  ## New Tables
  
  ### 1. `user_profiles`
  Extends Supabase auth.users with app-specific data
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique)
  - `display_name` (text)
  - `avatar_url` (text)
  - `total_points` (integer, default 0)
  - `current_level` (integer, default 1)
  - `current_streak` (integer, default 0)
  - `best_streak` (integer, default 0)
  - `last_activity_date` (date)
  - `monthly_budget` (decimal)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. `categories`
  Expense categories for AI classification
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `icon` (text, emoji or icon name)
  - `color` (text, hex color)
  - `description` (text)
  - `created_at` (timestamptz)
  
  ### 3. `expenses`
  User expense records
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `amount` (decimal)
  - `description` (text)
  - `category_id` (uuid, references categories)
  - `date` (date)
  - `is_ai_categorized` (boolean, default false)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `achievements`
  Available achievements for gamification
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `icon` (text)
  - `points_reward` (integer)
  - `requirement_type` (text: streak, savings, expenses_logged, etc.)
  - `requirement_value` (integer)
  - `tier` (text: bronze, silver, gold, platinum)
  - `created_at` (timestamptz)
  
  ### 5. `user_achievements`
  Tracks which achievements users have earned
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `achievement_id` (uuid, references achievements)
  - `earned_at` (timestamptz)
  - Unique constraint on (user_id, achievement_id)
  
  ### 6. `savings_goals`
  User-defined savings goals
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `title` (text)
  - `target_amount` (decimal)
  - `current_amount` (decimal, default 0)
  - `deadline` (date)
  - `emoji` (text)
  - `is_completed` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Categories and achievements are readable by all authenticated users
  - Only authenticated users can create/update their own records
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  total_points integer DEFAULT 0 NOT NULL,
  current_level integer DEFAULT 1 NOT NULL,
  current_streak integer DEFAULT 0 NOT NULL,
  best_streak integer DEFAULT 0 NOT NULL,
  last_activity_date date,
  monthly_budget decimal(10,2),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  is_ai_categorized boolean DEFAULT false NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  points_reward integer NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  tier text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0 NOT NULL,
  deadline date,
  emoji text DEFAULT '🎯' NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for categories (readable by all authenticated users)
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for expenses
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for achievements (readable by all authenticated users)
CREATE POLICY "Authenticated users can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for savings_goals
CREATE POLICY "Users can view own savings goals"
  ON savings_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
  ON savings_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
  ON savings_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals"
  ON savings_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, icon, color, description) VALUES
  ('Food & Dining', '🍕', '#FF6B6B', 'Restaurants, groceries, and food delivery'),
  ('Entertainment', '🎮', '#4ECDC4', 'Movies, games, streaming services, and fun'),
  ('Shopping', '🛍️', '#FFE66D', 'Clothes, gadgets, and retail therapy'),
  ('Transportation', '🚗', '#95E1D3', 'Gas, uber, public transit, and parking'),
  ('Education', '📚', '#A8E6CF', 'Books, courses, and learning materials'),
  ('Health & Fitness', '💪', '#FF8B94', 'Gym, sports, and wellness'),
  ('Bills & Utilities', '💡', '#C7CEEA', 'Rent, phone, internet, and subscriptions'),
  ('Social', '🎉', '#FFDAC1', 'Hanging out, parties, and socializing'),
  ('Coffee & Snacks', '☕', '#B4A7D6', 'Daily coffee runs and quick bites'),
  ('Other', '📌', '#A0A0A0', 'Everything else')
ON CONFLICT (name) DO NOTHING;

-- Insert starter achievements
INSERT INTO achievements (name, description, icon, points_reward, requirement_type, requirement_value, tier) VALUES
  ('First Step', 'Log your first expense', '🌟', 10, 'expenses_logged', 1, 'bronze'),
  ('Getting Started', 'Log 10 expenses', '⭐', 50, 'expenses_logged', 10, 'bronze'),
  ('Habit Former', 'Log expenses for 7 days straight', '🔥', 100, 'streak', 7, 'silver'),
  ('On Fire!', 'Maintain a 30-day streak', '🚀', 300, 'streak', 30, 'gold'),
  ('Legendary Saver', 'Maintain a 100-day streak', '👑', 1000, 'streak', 100, 'platinum'),
  ('Budget Newbie', 'Set your first savings goal', '🎯', 25, 'goals_created', 1, 'bronze'),
  ('Goal Crusher', 'Complete your first savings goal', '💎', 200, 'goals_completed', 1, 'silver'),
  ('Expense Tracker', 'Log 50 expenses', '📊', 150, 'expenses_logged', 50, 'silver'),
  ('Budget Master', 'Log 200 expenses', '🏆', 500, 'expenses_logged', 200, 'gold'),
  ('Savings Champion', 'Complete 5 savings goals', '👑', 800, 'goals_completed', 5, 'platinum')
ON CONFLICT DO NOTHING;