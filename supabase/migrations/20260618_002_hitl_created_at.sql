-- Add created_at timestamp to hitl_reviews table
ALTER TABLE hitl_reviews
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
