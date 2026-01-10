-- Add new columns to matches table for Friendlies
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS match_type TEXT, -- 'Open Match' or 'Friendlies'
ADD COLUMN IF NOT EXISTS match_format TEXT, -- '5vs5', '7vs7', '9vs9', '11vs11'
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS winning_mode TEXT; -- 'Loser Pays All', 'Winner 30% / Loser 70%', etc.

-- Add team roster column (JSONB array of player IDs)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS team_roster JSONB DEFAULT '[]'::jsonb;
