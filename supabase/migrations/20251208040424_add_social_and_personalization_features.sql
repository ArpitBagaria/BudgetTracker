/*
  # Add Social Features, AI Persona, and Visual Goals

  ## Overview
  Extends the app with college-friendly features: squads/teams, AI roast persona,
  visual goal tracking, streak freezes, loot boxes, and personality customization.

  ## Changes to Existing Tables

  ### user_profiles
  Add columns for personalization and social features:
  - `ai_persona` (text) - Type of AI companion: roaster, hype_man, wise_sage
  - `theme_preference` (text) - neobrutalism, glassmorphism, cyberpunk, default
  - `dark_mode` (boolean) - User's theme preference
  - `squad_id` (uuid) - Reference to their squad/team
  - `streak_freezes` (integer) - Number of streak freezes available
  - `loot_boxes` (integer) - Number of unopened loot boxes

  ## New Tables

  ### squads
  Teams/groups for social competition
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `emoji` (text)
  - `invite_code` (text, unique)
  - `total_members` (integer)
  - `total_squad_points` (integer)
  - `created_by` (uuid, references user_profiles)
  - `created_at` (timestamptz)

  ### visual_goals
  Goals with actual product images and links
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `title` (text)
  - `target_amount` (decimal)
  - `current_amount` (decimal)
  - `image_url` (text)
  - `product_link` (text)
  - `deadline` (date)
  - `is_completed` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### ai_roasts
  Store AI-generated roasts and hypes for user spending
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `expense_id` (uuid, references expenses)
  - `message` (text)
  - `type` (text) - roast, hype, warning, celebration
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ### loot_box_items
  Available rewards in loot boxes
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `type` (text) - avatar, badge, streak_freeze, points_boost
  - `rarity` (text) - common, rare, epic, legendary
  - `value` (jsonb) - The actual reward data
  - `created_at` (timestamptz)

  ### user_inventory
  Items users have collected
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `item_id` (uuid, references loot_box_items)
  - `quantity` (integer)
  - `obtained_at` (timestamptz)

  ### streak_history
  Track user streak performance over time
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `date` (date)
  - `had_activity` (boolean)
  - `used_freeze` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own data
  - Squad data is readable by squad members
*/

-- Add columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'ai_persona'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN ai_persona text DEFAULT 'roaster' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN theme_preference text DEFAULT 'default' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'dark_mode'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN dark_mode boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'squad_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN squad_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'streak_freezes'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN streak_freezes integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'loot_boxes'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN loot_boxes integer DEFAULT 1 NOT NULL;
  END IF;
END $$;

-- Create squads table
CREATE TABLE IF NOT EXISTS squads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  emoji text DEFAULT '🏆' NOT NULL,
  invite_code text UNIQUE NOT NULL,
  total_members integer DEFAULT 1 NOT NULL,
  total_squad_points integer DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create visual_goals table
CREATE TABLE IF NOT EXISTS visual_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0 NOT NULL,
  image_url text,
  product_link text,
  deadline date,
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create ai_roasts table
CREATE TABLE IF NOT EXISTS ai_roasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create loot_box_items table
CREATE TABLE IF NOT EXISTS loot_box_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  rarity text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES loot_box_items(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  obtained_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Create streak_history table
CREATE TABLE IF NOT EXISTS streak_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  had_activity boolean DEFAULT true NOT NULL,
  used_freeze boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_visual_goals_user_id ON visual_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_roasts_user_id ON ai_roasts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_date ON streak_history(user_id, date);
CREATE INDEX IF NOT EXISTS idx_squads_invite_code ON squads(invite_code);

-- Add foreign key for squad_id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_squad_id_fkey'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_squad_id_fkey
      FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_roasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for squads
CREATE POLICY "Users can view squads they are members of"
  ON squads FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT squad_id FROM user_profiles WHERE id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create squads"
  ON squads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Squad creators can update their squads"
  ON squads FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for visual_goals
CREATE POLICY "Users can view own visual goals"
  ON visual_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visual goals"
  ON visual_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visual goals"
  ON visual_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own visual goals"
  ON visual_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_roasts
CREATE POLICY "Users can view own roasts"
  ON ai_roasts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roasts"
  ON ai_roasts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roasts"
  ON ai_roasts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for loot_box_items (readable by all)
CREATE POLICY "Authenticated users can view loot box items"
  ON loot_box_items FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_inventory
CREATE POLICY "Users can view own inventory"
  ON user_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON user_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for streak_history
CREATE POLICY "Users can view own streak history"
  ON streak_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak history"
  ON streak_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert starter loot box items
INSERT INTO loot_box_items (name, description, type, rarity, value) VALUES
  ('Streak Shield', 'Protects your streak for one day', 'streak_freeze', 'common', '{"freezes": 1}'::jsonb),
  ('Double Points', '2x points for the next 3 expenses', 'points_boost', 'rare', '{"multiplier": 2, "uses": 3}'::jsonb),
  ('Fire Avatar', 'Your profile is literally on fire', 'avatar', 'epic', '{"avatar": "fire"}'::jsonb),
  ('Money Rain', '3x points for the next 5 expenses', 'points_boost', 'epic', '{"multiplier": 3, "uses": 5}'::jsonb),
  ('Legendary Saver Badge', 'Shows everyone you mean business', 'badge', 'legendary', '{"badge": "legendary_saver"}'::jsonb),
  ('Ice Avatar', 'Stay cool while your savings heat up', 'avatar', 'rare', '{"avatar": "ice"}'::jsonb),
  ('Triple Freeze', '3 streak protection shields', 'streak_freeze', 'rare', '{"freezes": 3}'::jsonb),
  ('Diamond Hands', 'No-spend achievement multiplier', 'points_boost', 'legendary', '{"multiplier": 5, "uses": 1}'::jsonb)
ON CONFLICT DO NOTHING;
