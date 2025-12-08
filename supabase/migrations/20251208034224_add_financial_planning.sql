/*
  # Add Financial Planning and Onboarding

  ## Overview
  Extends the user_profiles table with financial planning data collected during onboarding.
  Adds a quotes table for motivational wisdom throughout the app.

  ## Changes to Existing Tables

  ### user_profiles
  Add columns for financial planning:
  - `onboarding_completed` (boolean) - Track if user finished onboarding
  - `monthly_income` (decimal) - User's monthly income
  - `target_savings` (decimal) - How much they want to save monthly
  - `weekday_budget` (jsonb) - Breakdown of weekday expenses by category
  - `weekend_budget` (jsonb) - Breakdown of weekend expenses by category

  ## New Tables

  ### financial_plan
  Store the calculated financial plan for each user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `monthly_income` (decimal)
  - `total_expenses` (decimal)
  - `suggested_savings` (decimal)
  - `necessities_amount` (decimal)
  - `discretionary_amount` (decimal)
  - `suggestions` (jsonb) - AI suggestions for cutting expenses
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### motivational_quotes
  Store motivational quotes and wisdom
  - `id` (uuid, primary key)
  - `quote` (text)
  - `author` (text)
  - `category` (text) - motivational, educational, warning, celebration
  - `context` (text) - when to show: onboarding, overspending, saving_well, etc.
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on new tables
  - Users can only access their own financial plans
  - Quotes are readable by all authenticated users
*/

-- Add new columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'monthly_income'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN monthly_income decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'target_savings'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN target_savings decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'weekday_budget'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN weekday_budget jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'weekend_budget'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN weekend_budget jsonb;
  END IF;
END $$;

-- Create financial_plan table
CREATE TABLE IF NOT EXISTS financial_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_income decimal(10,2) NOT NULL,
  total_expenses decimal(10,2) NOT NULL,
  suggested_savings decimal(10,2) NOT NULL,
  necessities_amount decimal(10,2) NOT NULL,
  discretionary_amount decimal(10,2) NOT NULL,
  suggestions jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create motivational_quotes table
CREATE TABLE IF NOT EXISTS motivational_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author text,
  category text NOT NULL,
  context text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_plan_user_id ON financial_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_context ON motivational_quotes(context);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON motivational_quotes(category);

-- Enable RLS
ALTER TABLE financial_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_plan
CREATE POLICY "Users can view own financial plan"
  ON financial_plan FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial plan"
  ON financial_plan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial plan"
  ON financial_plan FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for motivational_quotes
CREATE POLICY "Authenticated users can view quotes"
  ON motivational_quotes FOR SELECT
  TO authenticated
  USING (true);

-- Insert motivational quotes
INSERT INTO motivational_quotes (quote, author, category, context) VALUES
  ('Every dollar saved is a step toward freedom.', 'Unknown', 'motivational', 'onboarding'),
  ('Small daily improvements lead to stunning results over time.', 'Robin Sharma', 'motivational', 'onboarding'),
  ('It''s not about having a lot. It''s about having what you need and being smart with it.', 'Unknown', 'educational', 'onboarding'),
  ('Your future self will thank you for the choices you make today.', 'Unknown', 'motivational', 'saving_well'),
  ('Compound interest is the eighth wonder of the world.', 'Albert Einstein', 'educational', 'onboarding'),
  ('Don''t save what is left after spending; spend what is left after saving.', 'Warren Buffett', 'educational', 'onboarding'),
  ('The habit of saving is itself an education.', 'T.T. Munger', 'motivational', 'onboarding'),
  ('A budget is telling your money where to go instead of wondering where it went.', 'Dave Ramsey', 'educational', 'planning'),
  ('Financial peace isn''t the acquisition of stuff. It''s learning to live on less than you make.', 'Dave Ramsey', 'educational', 'planning'),
  ('The best time to start was yesterday. The next best time is now.', 'Unknown', 'motivational', 'onboarding'),
  ('Small leaks sink great ships. Track every expense.', 'Benjamin Franklin', 'warning', 'overspending'),
  ('You''re doing great! Consistency is the key to wealth.', 'Unknown', 'celebration', 'streak'),
  ('That daily coffee adds up. Consider brewing at home a few times a week.', 'Unknown', 'educational', 'overspending'),
  ('Think of savings not as sacrifice, but as paying your future self.', 'Unknown', 'motivational', 'planning'),
  ('Building wealth is a marathon, not a sprint. You''re on the right track!', 'Unknown', 'celebration', 'saving_well'),
  ('Every time you choose to save, you''re choosing freedom over instant gratification.', 'Unknown', 'motivational', 'expense_added'),
  ('Remember why you started. Your goals are worth it.', 'Unknown', 'motivational', 'losing_streak'),
  ('Making mistakes is part of learning. What matters is getting back on track.', 'Unknown', 'motivational', 'overspending'),
  ('Your 30-year-old self is watching. Make them proud.', 'Unknown', 'motivational', 'planning'),
  ('The pain of discipline weighs ounces. The pain of regret weighs tons.', 'Jim Rohn', 'educational', 'overspending')
ON CONFLICT DO NOTHING;
