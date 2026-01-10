-- Add RLS policy for updating teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy: Only the creator (captain) can update the team
CREATE POLICY "Captains can update their own teams"
ON teams
FOR UPDATE
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Policy: Everyone can view teams (already implied if they can see the page, but let's be explicit)
CREATE POLICY "Anyone can view teams"
ON teams
FOR SELECT
USING (true);

-- Policy: Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
ON teams
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
