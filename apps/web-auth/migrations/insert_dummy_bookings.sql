-- Insert dummy bookings for testing
DO $$
DECLARE
    v_venue_id UUID;
    v_court_id UUID;
    v_user_id UUID;
BEGIN
    -- Get the first venue found (likely the user's venue)
    SELECT id, owner_id INTO v_venue_id, v_user_id FROM venues LIMIT 1;
    
    -- Get a court for that venue
    SELECT id INTO v_court_id FROM courts WHERE venue_id = v_venue_id LIMIT 1;

    -- Insert booking if venue and court exist
    IF v_venue_id IS NOT NULL AND v_court_id IS NOT NULL THEN
        -- Booking 1: Today 10am
        INSERT INTO bookings (venue_id, court_id, user_id, date, start_time, end_time, status)
        VALUES (
            v_venue_id,
            v_court_id,
            v_user_id, -- Use owner as user for test
            CURRENT_DATE,
            '10:00:00',
            '11:00:00',
            'confirmed'
        );
        
        -- Booking 2: Tomorrow 2pm
        INSERT INTO bookings (venue_id, court_id, user_id, date, start_time, end_time, status)
        VALUES (
            v_venue_id,
            v_court_id,
            v_user_id,
            CURRENT_DATE + INTERVAL '1 day',
            '14:00:00',
            '16:00:00',
            'confirmed'
        );
        
        -- Booking 3: Yesterday (Completed/Past)
        INSERT INTO bookings (venue_id, court_id, user_id, date, start_time, end_time, status)
        VALUES (
            v_venue_id,
            v_court_id,
            v_user_id,
            CURRENT_DATE - INTERVAL '1 day',
            '20:00:00',
            '22:00:00',
            'completed'
        );
    END IF;
END $$;
