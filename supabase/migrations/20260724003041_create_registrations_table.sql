-- Create registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  alamat TEXT NOT NULL,
  google_maps_link TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  jumlah_orang TEXT NOT NULL,
  durasi_langganan TEXT NOT NULL,
  dari_mana TEXT NOT NULL,
  alasan TEXT NOT NULL,
  saran TEXT,
  masalah_persampahan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for registration form)
CREATE POLICY "Allow public insert registrations"
ON registrations
FOR INSERT
WITH CHECK (true);

-- Allow authenticated read (for admin dashboard)
CREATE POLICY "Allow authenticated read registrations"
ON registrations
FOR SELECT
USING (auth.role() = 'authenticated');
