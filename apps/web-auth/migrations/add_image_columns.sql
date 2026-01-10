-- Add image URL columns to profiles table
-- These will store base64-encoded compressed images

-- Add avatar_url column (TEXT type for base64 images)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add hero_url column (TEXT type for base64 images)  
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS hero_url TEXT;

-- Add helpful comment
COMMENT ON COLUMN profiles.avatar_url IS 'User profile avatar image (base64 encoded, compressed to ~400px width)';
COMMENT ON COLUMN profiles.hero_url IS 'Dashboard hero background image (base64 encoded, compressed to ~1200px width)';
