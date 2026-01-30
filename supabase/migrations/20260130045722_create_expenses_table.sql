/*
  # Create Expenses Table

  ## Overview
  This migration creates the expenses table for tracking personal expenses with idempotency support
  for safe retries in unreliable network conditions.

  ## New Tables
  
  ### `expenses`
  Main table for storing expense records with the following columns:
  - `id` (uuid, primary key) - Unique identifier for each expense
  - `amount` (numeric(12,2)) - Expense amount with 2 decimal precision for accurate money handling
  - `category` (text, not null) - Expense category (Food, Travel, Shopping, etc.)
  - `description` (text) - Optional description of the expense
  - `date` (date, not null) - Date when the expense occurred
  - `idempotency_key` (text, unique, not null) - Ensures no duplicate expense creation on retries
  - `created_at` (timestamptz) - Timestamp when the record was created

  ## Security
  - Enable Row Level Security (RLS) on expenses table
  - Add policy to allow all operations for now (authentication can be added later)

  ## Indexes
  - Index on `date` for efficient sorting
  - Index on `category` for efficient filtering
  - Unique index on `idempotency_key` for duplicate prevention

  ## Important Notes
  1. The `idempotency_key` ensures that if a client retries the same request (due to network issues,
     double-clicks, etc.), we won't create duplicate expenses
  2. Using `numeric(12,2)` for amount ensures accurate decimal handling without floating-point errors
  3. RLS is enabled but permissive for MVP - can be restricted later with authentication
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  category text NOT NULL CHECK (category <> ''),
  description text,
  date date NOT NULL,
  idempotency_key text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on expenses"
  ON expenses
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);