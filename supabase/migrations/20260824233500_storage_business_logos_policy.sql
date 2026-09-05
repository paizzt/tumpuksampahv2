-- Supabase Storage RLS Policies for bucket: business-logos

-- 1. Allow public / anonymous users to upload logos to the business-logos bucket
CREATE POLICY "Allow public upload to business-logos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'business-logos');

-- 2. Allow public to read / view logos in the business-logos bucket
CREATE POLICY "Allow public read business-logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-logos');

-- 3. Allow authenticated admin to update business_registrations
CREATE POLICY "Allow authenticated update business_registrations"
ON business_registrations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
