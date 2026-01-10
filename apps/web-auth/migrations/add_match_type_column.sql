-- Add match_type column to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_type TEXT DEFAULT 'Open Match';

-- Update existing matches to have a default match_type
UPDATE matches SET match_type = 'Open Match' WHERE match_type IS NULL;
