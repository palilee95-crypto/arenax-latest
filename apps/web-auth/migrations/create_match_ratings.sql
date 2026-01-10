-- Create match_ratings table
CREATE TABLE IF NOT EXISTS match_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
    team_rating INTEGER CHECK (team_rating >= 1 AND team_rating <= 5),
    system_rating INTEGER CHECK (system_rating >= 1 AND system_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_match_ratings_match_id ON match_ratings(match_id);
CREATE INDEX IF NOT EXISTS idx_match_ratings_user_id ON match_ratings(user_id);
