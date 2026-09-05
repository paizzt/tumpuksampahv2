-- Create business_registrations table
CREATE TABLE business_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_bisnis TEXT NOT NULL,
  jumlah_karyawan TEXT NOT NULL,
  tahun_berdiri TEXT NOT NULL,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  alamat TEXT NOT NULL,
  paket TEXT NOT NULL,
  durasi_langganan TEXT NOT NULL,
  alasan_kerjasama TEXT NOT NULL,
  syarat_ketentuan TEXT NOT NULL,
  collab_publikasi TEXT NOT NULL,
  logo_bisnis TEXT, -- Will store base64 string/URL
  arah_kompos TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE business_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for registration form)
CREATE POLICY "Allow public insert business_registrations"
ON business_registrations
FOR INSERT
WITH CHECK (true);

-- Allow authenticated read (for admin dashboard)
CREATE POLICY "Allow authenticated read business_registrations"
ON business_registrations
FOR SELECT
USING (auth.role() = 'authenticated');
