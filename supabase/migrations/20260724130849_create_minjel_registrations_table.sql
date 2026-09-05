-- Create minjel_registrations table
CREATE TABLE minjel_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  alamat TEXT NOT NULL,
  google_maps_link TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  jenis_tempat TEXT NOT NULL,
  usia TEXT NOT NULL,
  frekuensi_setor TEXT NOT NULL,
  kendala TEXT NOT NULL,
  metode_tukar TEXT NOT NULL,
  dari_mana TEXT NOT NULL,
  pertanyaan_saran TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE minjel_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous all operations (for form submission)
CREATE POLICY "allow_anon_all_minjel"
ON minjel_registrations
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
