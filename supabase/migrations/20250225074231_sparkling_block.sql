/*
  # Create contracts table and security policies

  1. New Tables
    - `contracts`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text)
      - `description` (text)
      - `expiry_date` (timestamp)
      - `status` (enum: active, expired, pending)
      - `parties_involved` (text array)
      - `pdf_url` (text, nullable)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on contracts table
    - Add policies for:
      - Select: Users can read their own contracts
      - Insert: Authenticated users can create contracts
      - Update: Users can update their own contracts
      - Delete: Users can delete their own contracts
*/

-- Create enum type for contract status
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'pending');

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  expiry_date timestamptz NOT NULL,
  status contract_status NOT NULL DEFAULT 'pending',
  parties_involved text[] NOT NULL DEFAULT '{}',
  pdf_url text,
  user_id uuid REFERENCES auth.users NOT NULL,
  CONSTRAINT valid_expiry_date CHECK (expiry_date > created_at)
);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own contracts"
  ON contracts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create contracts"
  ON contracts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
  ON contracts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
  ON contracts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX contracts_user_id_idx ON contracts(user_id);
CREATE INDEX contracts_status_idx ON contracts(status);
CREATE INDEX contracts_expiry_date_idx ON contracts(expiry_date);