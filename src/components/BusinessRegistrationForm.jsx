import { useState } from 'react';
import { X, CheckCircle, Upload, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TurnstileWidget from './TurnstileWidget';

const paketOptions = ['Starter', 'Green', 'Sustain', 'Impact'];
const durasiOptions = ['3 Bulan', '6 Bulan', '12 Bulan'];
const syaratOptions = ['Ya', 'Belum'];
const collabOptions = ['Siap', 'Belum'];
const arahKomposOptions = [
  { value: 'Diambil', label: 'Diambil (Mendapatkan kompos sesuai paket untuk penghijauan)' },
  { value: 'Didonasikan', label: 'Didonasikan (Hasil penjualan kompos digunakan untuk program sosial TS)' },
  { value: 'Dijual', label: 'Dijual (Dijual kembali kepada TS seharga Rp5.000/kg)' },
];

const initialFormData = {
  nama_bisnis: '',
  jumlah_karyawan: '',
  tahun_berdiri: '',
  nama: '',
  jabatan: '',
  whatsapp: '',
  alamat: '',
  paket: '',
  durasi_langganan: '',
  alasan_kerjasama: '',
  syarat_ketentuan: '',
  collab_publikasi: '',
  arah_kompos: '',
  logo_bisnis: '', // stores base64 string
  logo_name: '',
};

export default function BusinessRegistrationForm({ onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const [logoFile, setLogoFile] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5 MB.');
      return;
    }

    setLogoFile(file);
    setFormData((prev) => ({
      ...prev,
      logo_name: file.name,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError('Mohon selesaikan verifikasi keamanan (Turnstile).');
      return;
    }

    const requiredFields = [
      'nama_bisnis', 'jumlah_karyawan', 'tahun_berdiri', 'nama', 'jabatan',
      'whatsapp', 'alamat', 'paket', 'durasi_langganan', 'alasan_kerjasama',
      'syarat_ketentuan', 'collab_publikasi', 'arah_kompos',
    ];

    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError('Mohon lengkapi semua field yang wajib diisi.');
        return;
      }
    }

    if (!logoFile) {
      setError('Mohon upload logo bisnis Anda.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        setError('Supabase belum dikonfigurasi. Silakan isi file .env terlebih dahulu.');
        setLoading(false);
        return;
      }

      // 1. Upload file logo ke Supabase Storage bucket 'business-logos'
      const fileExt = logoFile.name.split('.').pop() || 'png';
      const sanitizedBizName = formData.nama_bisnis.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 25);
      const uniqueFileName = `${Date.now()}_${sanitizedBizName || 'logo'}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(uniqueFileName, logoFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Gagal mengunggah logo ke Storage: ' + uploadError.message);
      }

      // 2. Dapatkan Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(uniqueFileName);

      const submitData = {
        nama_bisnis: formData.nama_bisnis.trim(),
        jumlah_karyawan: formData.jumlah_karyawan.trim(),
        tahun_berdiri: formData.tahun_berdiri.trim(),
        nama: formData.nama.trim(),
        jabatan: formData.jabatan.trim(),
        whatsapp: formData.whatsapp.trim(),
        alamat: formData.alamat.trim(),
        paket: formData.paket,
        durasi_langganan: formData.durasi_langganan,
        alasan_kerjasama: formData.alasan_kerjasama.trim(),
        syarat_ketentuan: formData.syarat_ketentuan,
        collab_publikasi: formData.collab_publikasi,
        arah_kompos: formData.arah_kompos,
        logo_bisnis: publicUrl,
      };

      const { error: insertError } = await supabase
        .from('business_registrations')
        .insert([submitData]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal mengirim data. Silakan coba lagi.');
      console.error('Business registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
          <div className="form-success">
            <div className="form-success-icon">
              <CheckCircle size={36} />
            </div>
            <h3>Pendaftaran Bisnis Berhasil!</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
              Terima kasih sudah mendaftarkan bisnis Anda di Tumpuk Sampah. Silakan tunggu admin kami menghubungi Anda via WhatsApp untuk validasi data dan pengiriman kontrak kerja resmi.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ fontSize: '0.9rem' }}>
              Tutup
            </button>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '580px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Registrasi Kerja Sama Bisnis
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
          Lengkapi data profil bisnis Anda untuk bermitra dengan Tumpuk Sampah.
        </p>

        <div className="form-scroll">
          {error && <div className="form-error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Profil Bisnis */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Profil Bisnis
            </h5>

            <div className="form-group">
              <label className="form-label">
                Nama Bisnis / Instansi <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nama_bisnis"
                className="form-input"
                placeholder="Masukkan nama bisnis atau organisasi"
                value={formData.nama_bisnis}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Jumlah Karyawan Tetap <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="jumlah_karyawan"
                  className="form-input"
                  placeholder="Contoh: 10 orang"
                  value={formData.jumlah_karyawan}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Tahun Berdiri Bisnis <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="tahun_berdiri"
                  className="form-input"
                  placeholder="Contoh: 2021"
                  value={formData.tahun_berdiri}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Kontak Person */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kontak Representatif
            </h5>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Nama Lengkap <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  className="form-input"
                  placeholder="Masukkan nama Anda"
                  value={formData.nama}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Jabatan / Posisi <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="jabatan"
                  className="form-input"
                  placeholder="Contoh: Owner, Manager"
                  value={formData.jabatan}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nomor WhatsApp <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                className="form-input"
                placeholder="08xxx"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Alamat Operasional Bisnis <span className="required">*</span>
              </label>
              <textarea
                name="alamat"
                className="form-textarea"
                placeholder="Masukkan alamat lengkap lokasi bisnis Anda..."
                value={formData.alamat}
                onChange={handleChange}
              />
            </div>

            {/* Paket & Layanan */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Paket & Layanan
            </h5>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Pilihan Paket <span className="required">*</span>
                </label>
                <select
                  name="paket"
                  className="form-select"
                  value={formData.paket}
                  onChange={handleChange}
                >
                  <option value="">Pilih paket bisnis</option>
                  {paketOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Durasi Berlangganan <span className="required">*</span>
                </label>
                <select
                  name="durasi_langganan"
                  className="form-select"
                  value={formData.durasi_langganan}
                  onChange={handleChange}
                >
                  <option value="">Pilih durasi kontrak</option>
                  {durasiOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Arah Olahan Kompos <span className="required">*</span>
              </label>
              <select
                name="arah_kompos"
                className="form-select"
                value={formData.arah_kompos}
                onChange={handleChange}
              >
                <option value="">Pilih alokasi pupuk kompos</option>
                {arahKomposOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Upload Logo */}
            <div className="form-group">
              <label className="form-label">
                Upload Logo Bisnis <span className="required">*</span>
              </label>
              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-alt)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                {formData.logo_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                    <FileText size={24} />
                    <span>{formData.logo_name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                      Seret file ke sini atau klik untuk mengupload logo.
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                      Maksimal 10 MB (PDF, doc/docx, PNG, JPG)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ketentuan Lain */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ketentuan & Kolaborasi
            </h5>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Sudah Membaca Syarat & Ketentuan? <span className="required">*</span>
                </label>
                <select
                  name="syarat_ketentuan"
                  className="form-select"
                  value={formData.syarat_ketentuan}
                  onChange={handleChange}
                >
                  <option value="">Pilih kesiapan</option>
                  {syaratOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Kesediaan Publikasi / Post Collab? <span className="required">*</span>
                </label>
                <select
                  name="collab_publikasi"
                  className="form-select"
                  value={formData.collab_publikasi}
                  onChange={handleChange}
                >
                  <option value="">Pilih kesediaan</option>
                  {collabOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Tujuan atau Alasan Kerjasama dengan TS <span className="required">*</span>
              </label>
              <textarea
                name="alasan_kerjasama"
                className="form-textarea"
                placeholder="Ceritakan mengapa bisnis Anda tertarik bekerjasama..."
                value={formData.alasan_kerjasama}
                onChange={handleChange}
              />
            </div>

            <TurnstileWidget
              onVerify={(token) => {
                setTurnstileToken(token);
                setError('');
              }}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />

            <button type="submit" className="form-btn-submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
            </button>
          </form>
        </div>

        <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
      </div>
    </div>
  );
}
