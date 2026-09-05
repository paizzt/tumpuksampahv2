const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('Client.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws);

let sql = `-- Seed from Client.xlsx\n`;
sql += `INSERT INTO public.registrations (nama, email, whatsapp, alamat, google_maps_link, pekerjaan, jumlah_orang, durasi_langganan, dari_mana, alasan, masalah_persampahan, saran) VALUES\n`;

const values = data.map(row => {
    const nama = (row['Nama'] || '').replace(/'/g, "''");
    const email = (row['Email'] || '').replace(/'/g, "''");
    const waKey = Object.keys(row).find(k => k.toLowerCase().includes('whatsapp'));
    const whatsapp = (row[waKey] || '').replace(/'/g, "''");
    const alamatKey = Object.keys(row).find(k => k.toLowerCase().includes('alamat lengkap'));
    const alamat = (row[alamatKey] || '').replace(/'/g, "''");
    const gmapsKey = Object.keys(row).find(k => k.toLowerCase().includes('gmaps'));
    const gmaps = (row[gmapsKey] || '').replace(/'/g, "''");
    const langganan = (row['Langganan'] || '').replace(/'/g, "''");
    const dariManaKey = Object.keys(row).find(k => k.toLowerCase().includes('dari mana'));
    const dari_mana = (row[dariManaKey] || '').replace(/'/g, "''");
    const saranKey = Object.keys(row).find(k => k.toLowerCase().includes('saran'));
    const saran = (row[saranKey] || '').replace(/'/g, "''");
    
    // Default some missing fields since excel doesn't have them
    const pekerjaan = 'Tidak disebutkan';
    const jumlah_orang = 'Tidak disebutkan';
    const alasan = 'Tidak disebutkan';
    const masalah_persampahan = 'Tidak disebutkan';

    return `('${nama}', '${email}', '${whatsapp}', '${alamat}', '${gmaps}', '${pekerjaan}', '${jumlah_orang}', '${langganan}', '${dari_mana}', '${alasan}', '${masalah_persampahan}', '${saran}')`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('supabase/migrations/20260905020000_seed_clients.sql', sql);
console.log('Seed file generated.');
