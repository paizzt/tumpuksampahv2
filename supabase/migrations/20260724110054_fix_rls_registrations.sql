-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Allow public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated read registrations" ON registrations;

-- Allow anyone to insert (for registration form)
CREATE POLICY "Allow public insert registrations"
ON registrations
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to read (for admin dashboard)
CREATE POLICY "Allow authenticated read registrations"
ON registrations
FOR SELECT
TO authenticated
USING (true);
