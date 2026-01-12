-- Fix User Deletion: Add ON DELETE CASCADE to foreign keys and update RLS policies

-- 1. Update Venues Table
ALTER TABLE public.venues 
DROP CONSTRAINT IF EXISTS venues_owner_id_fkey,
ADD CONSTRAINT venues_owner_id_fkey 
    FOREIGN KEY (owner_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 2. Update Bookings Table
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
ADD CONSTRAINT bookings_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 3. Update Matches Table
ALTER TABLE public.matches 
DROP CONSTRAINT IF EXISTS matches_creator_id_fkey,
ADD CONSTRAINT matches_creator_id_fkey 
    FOREIGN KEY (creator_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 4. Update RLS Policy for Profiles
-- Allow admins to delete profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- 5. Ensure Profiles can be deleted by the user themselves (optional but good practice)
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);
