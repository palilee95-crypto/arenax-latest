-- Clear all mock data from the database
-- WARNING: This will delete all data in the specified tables.

TRUNCATE TABLE match_players CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE courts CASCADE;
TRUNCATE TABLE venues CASCADE;

-- Optional: Reset sequences if needed
-- ALTER SEQUENCE venues_id_seq RESTART WITH 1;
-- ALTER SEQUENCE courts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE matches_id_seq RESTART WITH 1;
-- ALTER SEQUENCE bookings_id_seq RESTART WITH 1;
