import { useState } from 'react';
import { X, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TurnstileWidget from './TurnstileWidget';

const pekerjaanOptions = [
  'Pebisnis / Pedagang',
  'PNS / ASN',
  'Pegawai Swasta',
  'Ibu Rumah Tangga',
  'Guru / Dosen',
  'Pelajar / Mahasiswa',
  'Lainnya',
];

const jenisTempatOptions = [
  'Rumah Tangga',
  'Warung Makan',
  'Restoran',
  'Lainnya',
];

const usiaOptions = [
  '20 - 25 tahun',
  '26 - 30 tahun',
  '31 - 35 tahun',
  '36 - 40 tahun',
  '41 - 50 tahun',
];

const frekuensiOptions = [
  'Sesuai Mood',
  'Terjadwal (misal: sepekan sekali)',
  'Saat Wadah Penampungan Sudah Penuh',
  'Lainnya',
];

const kendalaOptions = [
  'Tempat Penyimpanan Penuh',
  'Tidak Tahu Harus Setor Kemana',
  'Kesulitan Transportasi Pengiriman',
  'Harga Beli Murah',
  'Lainnya',
];

const metodeTukarOptions = [
  'Cash / Tunai',
  'Transfer / E-Wallet',
  'Ditukar dengan Sembako',
  'Didonasikan untuk Program Lingkungan',
];

const dariManaOptions = [
  'Instagram',
  'Grup WhatsApp',
  'Tetangga',
  'Teman',
  'Tiktok',
  'Threads',
  'Lainnya',
];

const lokasiSetor = [
  { label: 'Tumpuk Sampah di Jl. Malengkeri', href: 'https://maps.app.goo.gl/jzcXEKcdtUnsjUxQ6' },
  { label: 'Artani di Jl. Rappocini', href: 'https://maps.app.goo.gl/zGYo7THEde1UVTFL8' },
  { label: "Toko Buahta' di BTP", href: 'https://maps.app.goo.gl/PvZwyf6iGCzqqSuo6' },
  { label: 'Villa Mutiara Asri di Summarecon', href: 'https://maps.app.goo.gl/q7MnggKXcwfofJEC6' },
];

const initialFormData = {
  nama: '',
  whatsapp: '',
  alamat: '',
  google_maps_link: '',
  pekerjaan: '',
  pekerjaan_lain: '',
  jenis_tempat: '',
  jenis_tempat_lain: '',
  usia: '',
  frekuensi_setor: '',
  frekuensi_setor_lain: '',
  kendala: '',
  kendala_lain: '',
  metode_tukar: '',
  dari_mana: '',
  dari_mana_lain: '',
  pertanyaan_saran: '',
};

export default function MinjelForm({ onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const getFieldValue = (field, lainField) => {
    return formData[field] === 'Lainnya'
      ? `Lainnya: ${formData[lainField].trim()}`
      : formData[field];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError('Mohon selesaikan verifikasi keamanan (Turnstile).');
      return;
    }

    const requiredFields = [
      'nama', 'whatsapp', 'alamat', 'google_maps_link',
      'pekerjaan', 'jenis_tempat', 'usia', 'frekuensi_setor',
      'kendala', 'metode_tukar', 'dari_mana',
    ];

    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError('Mohon lengkapi semua field yang wajib diisi.');
        return;
      }
    }

    const lainFields = {
      pekerjaan: 'pekerjaan_lain',
      jenis_tempat: 'jenis_tempat_lain',
      frekuensi_setor: 'frekuensi_setor_lain',
      kendala: 'kendala_lain',
      dari_mana: 'dari_mana_lain',
    };

    const submitData = {
      nama: formData.nama.trim(),
      whatsapp: formData.whatsapp.trim(),
      alamat: formData.alamat.trim(),
      google_maps_link: formData.google_maps_link.trim(),
      pekerjaan: getFieldValue('pekerjaan', lainFields.pekerjaan),
      jenis_tempat: getFieldValue('jenis_tempat', lainFields.jenis_tempat),
      usia: formData.usia,
      frekuensi_setor: getFieldValue('frekuensi_setor', lainFields.frekuensi_setor),
      kendala: getFieldValue('kendala', lainFields.kendala),
      metode_tukar: formData.metode_tukar,
      dari_mana: getFieldValue('dari_mana', lainFields.dari_mana),
      pertanyaan_saran: formData.pertanyaan_saran.trim() || null,
    };

    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        setError('Supabase belum dikonfigurasi. Silakan isi file .env terlebih dahulu.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('minjel_registrations')
        .insert([submitData]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      setError('Gagal mengirim data. Silakan coba lagi.');
      console.error('Minjel registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
          <div className="form-success">
            <div className="form-success-icon">
              <CheckCircle size={36} />
            </div>
            <h3>Pendaftaran Berhasil!</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
              Terima kasih sudah mendaftar TS MINJEL. Silakan kunjungi titik setor terdekat untuk menyetor minyak jelantah Anda.
            </p>

            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.95rem' }}>4 Titik Setor Minyak Jelantah:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {lokasiSetor.map((loc, idx) => (
                  <a
                    key={idx}
                    href={loc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="service-btn"
                    style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <MapPin size={16} />
                    {loc.label}
                  </a>
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600', marginTop: '0.75rem' }}>
                1kg = Rp2.500
              </p>
            </div>

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
        style={{ maxWidth: '560px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          TS MINJEL — Setor Minyak Jelantah
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
          Minyak jelantah bisa jadi uang! 1kg = Rp2.500
        </p>

        <div className="form-scroll">
          {error && <div className="form-error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Data Diri */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Diri</h5>

            <div className="form-group">
              <label className="form-label">
                Nama Lengkap <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nama"
                className="form-input"
                placeholder="Masukkan nama lengkap"
                value={formData.nama}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
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
                  Usia <span className="required">*</span>
                </label>
                <select
                  name="usia"
                  className="form-select"
                  value={formData.usia}
                  onChange={handleChange}
                >
                  <option value="">Pilih usia</option>
                  {usiaOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Alamat Lengkap <span className="required">*</span>
              </label>
              <textarea
                name="alamat"
                className="form-textarea"
                placeholder="Contoh: Perumahan Sustainability, Jl. Mallengkeri, Kel. Mangasa, Kec. Tamalate"
                value={formData.alamat}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Link Google Maps <span className="required">*</span>
              </label>
              <input
                type="url"
                name="google_maps_link"
                className="form-input"
                placeholder="https://maps.app.goo.gl/..."
                value={formData.google_maps_link}
                onChange={handleChange}
              />
              <p className="form-hint">Agar lebih mudah kalau butuh pickup.</p>
            </div>

            {/* Profil */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profil</h5>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Pekerjaan <span className="required">*</span>
                </label>
                <select
                  name="pekerjaan"
                  className="form-select"
                  value={formData.pekerjaan}
                  onChange={handleChange}
                >
                  <option value="">Pilih pekerjaan</option>
                  {pekerjaanOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {formData.pekerjaan === 'Lainnya' && (
                  <input
                    type="text"
                    name="pekerjaan_lain"
                    className="form-input form-other-input"
                    placeholder="Sebutkan pekerjaan Anda"
                    value={formData.pekerjaan_lain}
                    onChange={handleChange}
                  />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">
                  Jenis Tempat <span className="required">*</span>
                </label>
                <select
                  name="jenis_tempat"
                  className="form-select"
                  value={formData.jenis_tempat}
                  onChange={handleChange}
                >
                  <option value="">Pilih jenis tempat</option>
                  {jenisTempatOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {formData.jenis_tempat === 'Lainnya' && (
                  <input
                    type="text"
                    name="jenis_tempat_lain"
                    className="form-input form-other-input"
                    placeholder="Sebutkan jenis tempat"
                    value={formData.jenis_tempat_lain}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>

            {/* Setor Minyak */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Setor Minyak</h5>

            <div className="form-group">
              <label className="form-label">
                Seberapa sering menyetor minyak? <span className="required">*</span>
              </label>
              <select
                name="frekuensi_setor"
                className="form-select"
                value={formData.frekuensi_setor}
                onChange={handleChange}
              >
                <option value="">Pilih frekuensi</option>
                {frekuensiOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {formData.frekuensi_setor === 'Lainnya' && (
                <input
                  type="text"
                  name="frekuensi_setor_lain"
                  className="form-input form-other-input"
                  placeholder="Sebutkan frekuensi Anda"
                  value={formData.frekuensi_setor_lain}
                  onChange={handleChange}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Kendala utama saat menyetor? <span className="required">*</span>
              </label>
              <select
                name="kendala"
                className="form-select"
                value={formData.kendala}
                onChange={handleChange}
              >
                <option value="">Pilih kendala</option>
                {kendalaOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {formData.kendala === 'Lainnya' && (
                <input
                  type="text"
                  name="kendala_lain"
                  className="form-input form-other-input"
                  placeholder="Sebutkan kendala Anda"
                  value={formData.kendala_lain}
                  onChange={handleChange}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Metode penukaran yang diinginkan <span className="required">*</span>
              </label>
              <select
                name="metode_tukar"
                className="form-select"
                value={formData.metode_tukar}
                onChange={handleChange}
              >
                <option value="">Pilih metode</option>
                {metodeTukarOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Marketing */}
            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Informasi</h5>

            <div className="form-group">
              <label className="form-label">
                Dari mana info MINJEL? <span className="required">*</span>
              </label>
              <select
                name="dari_mana"
                className="form-select"
                value={formData.dari_mana}
                onChange={handleChange}
              >
                <option value="">Pilih salah satu</option>
                {dariManaOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {formData.dari_mana === 'Lainnya' && (
                <input
                  type="text"
                  name="dari_mana_lain"
                  className="form-input form-other-input"
                  placeholder="Sebutkan dari mana"
                  value={formData.dari_mana_lain}
                  onChange={handleChange}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Pertanyaan atau saran
              </label>
              <textarea
                name="pertanyaan_saran"
                className="form-textarea"
                placeholder="Tulis pertanyaan atau saran Anda di sini..."
                value={formData.pertanyaan_saran}
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
