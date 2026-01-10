-- 1. Create match_players table if it doesn't exist
CREATE TABLE IF NOT EXISTS match_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- 2. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player_id ON match_players(player_id);

-- 3. Add GPS columns to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- 4. Add check-in columns to match_players table
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS check_in_latitude NUMERIC;
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS check_in_longitude NUMERIC;
