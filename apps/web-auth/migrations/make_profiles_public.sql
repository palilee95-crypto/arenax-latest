-- Allow anyone to read profiles by ID
-- This is needed because Server Components might not have the session
-- and we need to fetch the profile to determine the role for redirection.
-- The data is limited to non-sensitive fields.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);
