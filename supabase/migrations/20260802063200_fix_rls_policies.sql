-- Fix RLS policies for registrations table
DROP POLICY IF EXISTS "allow_anon_all" ON registrations;
DROP POLICY IF EXISTS "Allow public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated read registrations" ON registrations;

CREATE POLICY "Allow public insert registrations"
ON registrations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated read registrations"
ON registrations
FOR SELECT
TO authenticated
USING (true);

-- Fix RLS policies for minjel_registrations table
DROP POLICY IF EXISTS "allow_anon_all_minjel" ON minjel_registrations;
DROP POLICY IF EXISTS "Allow public insert minjel_registrations" ON minjel_registrations;
DROP POLICY IF EXISTS "Allow authenticated read minjel_registrations" ON minjel_registrations;

CREATE POLICY "Allow public insert minjel_registrations"
ON minjel_registrations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated read minjel_registrations"
ON minjel_registrations
FOR SELECT
TO authenticated
USING (true);
