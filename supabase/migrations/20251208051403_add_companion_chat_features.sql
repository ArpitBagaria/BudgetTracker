/*
  # Add AI Companion Chat Features

  1. Schema Changes
    - Add `companion_name` column to `user_profiles` table
      - Stores user's custom name for their AI companion
      - Default to companion type name if not set
    
  2. New Tables
    - `companion_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `message` (text) - The message content
      - `sender` (text) - Either 'user' or 'companion'
      - `context` (text) - Context that triggered the message
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on `companion_messages` table
    - Add policies for authenticated users to:
      - Read their own messages
      - Insert their own messages
*/

-- Add companion_name to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'companion_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN companion_name text DEFAULT NULL;
  END IF;
END $$;

-- Create companion_messages table
CREATE TABLE IF NOT EXISTS companion_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'companion')),
  context text DEFAULT 'chat',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companion_messages ENABLE ROW LEVEL SECURITY;

-- Policies for companion_messages
CREATE POLICY "Users can view own companion messages"
  ON companion_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companion messages"
  ON companion_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_companion_messages_user_id 
  ON companion_messages(user_id, created_at DESC);