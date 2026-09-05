import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TurnstileWidget from './TurnstileWidget';

const pekerjaanOptions = [
  'Pegawai Negeri',
  'Swasta',
  'Pengusaha',
  'Guru / Dosen',
  'Ibu Rumah Tangga',
  'Wiraswasta',
  'PNS / ASN',
  'Lainnya',
];

const jumlahOrangOptions = ['1-2', '3-4', '5-6', '7-8', '9-10', 'Lainnya'];

const durasiOptions = [
  { value: '3 Bulan', label: '3 Bulan' },
  { value: '6 Bulan', label: '6 Bulan (Recommended)' },
  { value: '1 Tahun', label: '1 Tahun (10% Discount)' },
];

const dariManaOptions = ['Instagram', 'Teman', 'Event', 'Lainnya'];

const initialFormData = {
  nama: '',
  email: '',
  whatsapp: '',
  alamat: '',
  google_maps_link: '',
  pekerjaan: '',
  pekerjaan_lain: '',
  jumlah_orang: '',
  jumlah_orang_lain: '',
  durasi_langganan: '',
  dari_mana: '',
  dari_mana_lain: '',
  alasan: '',
  saran: '',
  masalah_persampahan: '',
};

export default function RegistrationForm({ onClose }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError('Mohon selesaikan verifikasi keamanan (Turnstile).');
      return;
    }

    const requiredFields = [
      'nama', 'email', 'whatsapp', 'alamat', 'google_maps_link',
      'pekerjaan', 'jumlah_orang', 'durasi_langganan', 'dari_mana',
      'alasan', 'masalah_persampahan',
    ];

    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError('Mohon lengkapi semua field yang wajib diisi.');
        return;
      }
    }

    const submitData = {
      nama: formData.nama.trim(),
      email: formData.email.trim(),
      whatsapp: formData.whatsapp.trim(),
      alamat: formData.alamat.trim(),
      google_maps_link: formData.google_maps_link.trim(),
      pekerjaan: formData.pekerjaan === 'Lainnya' ? formData.pekerjaan_lain.trim() : formData.pekerjaan,
      jumlah_orang: formData.jumlah_orang === 'Lainnya' ? formData.jumlah_orang_lain.trim() : formData.jumlah_orang,
      durasi_langganan: formData.durasi_langganan,
      dari_mana: formData.dari_mana === 'Lainnya' ? formData.dari_mana_lain.trim() : formData.dari_mana,
      alasan: formData.alasan.trim(),
      saran: formData.saran.trim() || null,
      masalah_persampahan: formData.masalah_persampahan.trim(),
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
        .from('registrations')
        .insert([submitData]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      setError('Gagal mengirim data. Silakan coba lagi.');
      console.error('Registration error:', err);
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
            <h3>Pendaftaran Berhasil!</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
              Terima kasih sudah mendaftar di Tumpuk Sampah. Silahkan tunggu admin kami menghubungi anda via WhatsApp untuk konfirmasi.
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
        style={{ maxWidth: '560px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
          Registrasi Untuk Rumah Tangga
        </h3>

        <div className="form-scroll">
          {error && <div className="form-error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Data Pribadi */}
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
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="email@contoh.com"
                  value={formData.email}
                  onChange={handleChange}
                />
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
            </div>

            <div className="form-group">
              <label className="form-label">
                Alamat Lengkap <span className="required">*</span>
              </label>
              <textarea
                name="alamat"
                className="form-textarea"
                placeholder="Contoh: Jl. Mallengkeri, Mangasa, Kec. Tamalate, Kota Makassar"
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
              <p className="form-hint">Link lokasi untuk memudahkan penjemputan.</p>
            </div>

            {/* Informasi Pelanggan */}
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
                  Jumlah Orang di Rumah <span className="required">*</span>
                </label>
                <select
                  name="jumlah_orang"
                  className="form-select"
                  value={formData.jumlah_orang}
                  onChange={handleChange}
                >
                  <option value="">Pilih jumlah</option>
                  {jumlahOrangOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {formData.jumlah_orang === 'Lainnya' && (
                  <input
                    type="text"
                    name="jumlah_orang_lain"
                    className="form-input form-other-input"
                    placeholder="Sebutkan jumlah"
                    value={formData.jumlah_orang_lain}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>

            {/* Paket Berlangganan */}
            <div className="form-group">
              <label className="form-label">
                Durasi Langganan <span className="required">*</span>
              </label>
              <select
                name="durasi_langganan"
                className="form-select"
                value={formData.durasi_langganan}
                onChange={handleChange}
              >
                <option value="">Pilih durasi</option>
                {durasiOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Marketing */}
            <div className="form-group">
              <label className="form-label">
                Tau "Tumpuk Sampah" dari mana? <span className="required">*</span>
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
                Alasan ikut langganan <span className="required">*</span>
              </label>
              <textarea
                name="alasan"
                className="form-textarea"
                placeholder="Ceritakan alasan Anda ingin berlangganan..."
                value={formData.alasan}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Saran</label>
              <textarea
                name="saran"
                className="form-textarea"
                placeholder="Tumpuk saranmu di sini (opsional)"
                value={formData.saran}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Masalah persampahan di tempat tinggal Anda <span className="required">*</span>
              </label>
              <textarea
                name="masalah_persampahan"
                className="form-textarea"
                placeholder="Ceritakan permasalahan sampah di area Anda..."
                value={formData.masalah_persampahan}
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
