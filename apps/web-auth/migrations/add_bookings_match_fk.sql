-- Add foreign key constraint to bookings table linking to matches table
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_match_id_fkey'
    ) THEN
        ALTER TABLE bookings 
        ADD CONSTRAINT bookings_match_id_fkey 
        FOREIGN KEY (match_id) 
        REFERENCES matches(id) 
        ON DELETE SET NULL;
    END IF;
END $$;
