-- Create Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    address TEXT,
    state TEXT,
    district TEXT,
    facilities TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to venues table if they don't exist (for backward compatibility)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'state') THEN
        ALTER TABLE venues ADD COLUMN state TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'district') THEN
        ALTER TABLE venues ADD COLUMN district TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'facilities') THEN
        ALTER TABLE venues ADD COLUMN facilities TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'image_url') THEN
        ALTER TABLE venues ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'opening_time') THEN
        ALTER TABLE venues ADD COLUMN opening_time TIME DEFAULT '08:00:00';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'closing_time') THEN
        ALTER TABLE venues ADD COLUMN closing_time TIME DEFAULT '23:00:00';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'nationality') THEN
        ALTER TABLE venues ADD COLUMN nationality TEXT DEFAULT 'Malaysia';
    END IF;
END $$;

-- Create Courts Table
CREATE TABLE IF NOT EXISTS courts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sport_type TEXT NOT NULL, -- 'Futsal', 'Football'
    price_per_hour NUMERIC DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled'
    match_id UUID, -- Will link to matches table later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id),
    venue_id UUID REFERENCES venues(id),
    court_id UUID REFERENCES courts(id),
    sport TEXT NOT NULL, -- 'Futsal', 'Football'
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_per_player NUMERIC DEFAULT 0,
    max_players INTEGER DEFAULT 10,
    current_players INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open', -- 'open', 'full', 'completed', 'cancelled'
    match_format TEXT,
    team_name TEXT,
    winning_mode TEXT,
    team_roster TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add court_id to matches table if it exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'court_id') THEN
        ALTER TABLE matches ADD COLUMN court_id UUID REFERENCES courts(id);
    END IF;
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

