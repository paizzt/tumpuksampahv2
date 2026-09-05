import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env manually
function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...values] = trimmed.split('=');
    env[key.trim()] = values.join('=').trim();
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or Key not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const adminEmail = process.argv[2];
  const adminPassword = process.argv[3];

  if (adminEmail && adminPassword) {
    console.log(`🔐 Signing in as admin (${adminEmail})...`);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (authError) {
      console.error('Authentication failed:', authError.message);
      process.exit(1);
    }
    console.log('✓ Successfully authenticated as admin.\n');
  }

  console.log('🔍 Fetching records from business_registrations...');
  const { data: records, error: fetchError } = await supabase
    .from('business_registrations')
    .select('id, nama_bisnis, logo_bisnis, created_at');

  if (fetchError) {
    console.error('Failed to fetch business_registrations:', fetchError.message);
    if (fetchError.message.includes('row-level security') || fetchError.code === '42501' || !records) {
      console.log('\n💡 Hint: Jalankan script dengan kredensial admin:');
      console.log('   node scripts/migrate-logos.mjs <admin_email> <admin_password>\n');
    }
    process.exit(1);
  }

  if (!records || records.length === 0) {
    console.log('ℹ️ Tidak ada data pendaftar bisnis ditemukan di database.');
    return;
  }

  console.log(`📊 Ditemukan total ${records.length} data pendaftar bisnis.`);
  const base64Records = records.filter(
    (r) => r.logo_bisnis && r.logo_bisnis.startsWith('data:')
  );

  console.log(`⚡ Ditemukan ${base64Records.length} record yang menggunakan format Base64.\n`);

  if (base64Records.length === 0) {
    console.log('✓ Semua logo sudah menggunakan format URL Storage atau tidak ada Base64. Tidak ada migrasi yang diperlukan!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const record of base64Records) {
    const rawData = record.logo_bisnis;
    const matches = rawData.match(/^data:([A-Za-z0-9-+/.]+);base64,(.+)$/s);

    if (!matches || matches.length !== 3) {
      console.warn(`⚠️ [${record.nama_bisnis}] Format base64 tidak valid, dilewati.`);
      failCount++;
      continue;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('pdf')) ext = 'pdf';

    const sanitizedBiz = (record.nama_bisnis || 'biz')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 25);
    const fileName = `migrated_${Date.now()}_${sanitizedBiz}.${ext}`;

    console.log(`⏳ [${record.nama_bisnis}] Mengupload (${(buffer.length / 1024).toFixed(1)} KB)...`);

    // 1. Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('business-logos')
      .upload(fileName, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ Gagal upload logo untuk [${record.nama_bisnis}]:`, uploadError.message);
      failCount++;
      continue;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('business-logos')
      .getPublicUrl(fileName);

    // 3. Update database row
    const { error: updateError } = await supabase
      .from('business_registrations')
      .update({ logo_bisnis: publicUrl })
      .eq('id', record.id);

    if (updateError) {
      console.error(`❌ Gagal memperbarui URL database untuk [${record.nama_bisnis}]:`, updateError.message);
      failCount++;
    } else {
      console.log(`✅ [${record.nama_bisnis}] Berhasil dimigrasikan -> ${publicUrl}`);
      successCount++;
    }
  }

  console.log('\n=========================================');
  console.log(`🎉 Migrasi Selesai!`);
  console.log(`   - Sukses: ${successCount}`);
  console.log(`   - Gagal: ${failCount}`);
  console.log('=========================================');
}

runMigration().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
