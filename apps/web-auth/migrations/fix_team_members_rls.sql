-- Allow team creators to add themselves as members
DROP POLICY IF EXISTS "Captains can add team members" ON public.team_members;

CREATE POLICY "Captains can add team members" 
ON public.team_members FOR INSERT 
WITH CHECK (
    -- Allow if user is adding themselves AND they are the creator of the team
    (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM public.teams 
        WHERE teams.id = team_members.team_id 
        AND teams.creator_id = auth.uid()
    ))
    OR
    -- Allow if user is the creator adding someone else (invite)
    EXISTS (
        SELECT 1 FROM public.teams 
        WHERE teams.id = team_members.team_id 
        AND teams.creator_id = auth.uid()
    )
);
