-- Add missing columns to matches table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'match_format') THEN
        ALTER TABLE matches ADD COLUMN match_format TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'team_name') THEN
        ALTER TABLE matches ADD COLUMN team_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'winning_mode') THEN
        ALTER TABLE matches ADD COLUMN winning_mode TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'team_roster') THEN
        ALTER TABLE matches ADD COLUMN team_roster TEXT[]; -- Array of user IDs
    END IF;
END $$;
