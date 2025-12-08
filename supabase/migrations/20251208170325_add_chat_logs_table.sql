/*
  # Add Chat Logs Table for AI Chatbot

  1. New Tables
    - `chat_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `message` (text) - User's message
      - `response` (text) - AI's response
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `chat_logs` table
    - Add policies for authenticated users to:
      - Read their own chat logs
      - Insert their own chat logs
*/

-- Create chat_logs table
CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Policies for chat_logs
CREATE POLICY "Users can view own chat logs"
  ON chat_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat logs"
  ON chat_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id 
  ON chat_logs(user_id, created_at DESC);