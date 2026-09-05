-- Disable RLS first, then re-enable with proper policies
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated read registrations" ON registrations;

-- Re-enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Single permissive policy: allow ALL operations for anon role
CREATE POLICY "allow_anon_all"
ON registrations
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
