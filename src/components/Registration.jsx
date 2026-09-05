import { X } from 'lucide-react';
import RegistrationForm from './RegistrationForm';
import BusinessRegistrationForm from './BusinessRegistrationForm';

export default function Registration({ showSelectModal, setShowSelectModal, activeForm, setActiveForm }) {

  const timelineSteps = [
    {
      title: "Daftar",
      desc: (
        <>
          Isi formulir pendaftaran dengan klik tombol di bawah: <br />
          <button
            onClick={() => setShowSelectModal(true)}
            style={{
              color: 'var(--color-primary)',
              fontWeight: 'bold',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              padding: 0,
              marginTop: '0.5rem',
              display: 'inline-block',
            }}
          >
            Formulir Pendaftaran
          </button>
        </>
      )
    },
    { title: "Konfirmasi", desc: "Admin validasi data via WhatsApp." },
    { title: "Pengantaran Alat", desc: "Wadah ember khusus diantar ke lokasi." },
    { title: "Mulai Memilah", desc: "Admin infokan jadwal, Anda mulai mengisi ember." },
    { title: "Tukar Ember", desc: "Ember penuh dijemput & ditukar yang baru tiap pekan." },
  ];

  return (
    <section className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
      <div className="text-center mb-8">
        <span className="tag">Pendaftaran & Ketentuan</span>
        <h2>Alur Pendaftaran</h2>
        <p style={{ color: 'var(--color-text-light)', maxWidth: '600px', margin: '0 auto' }}>Cara mudah bekerjasama dengan Tumpuk Sampah dalam 5 langkah praktis.</p>
      </div>

      {/* Timeline Row */}
      <div style={{ position: 'relative', margin: '4rem 0 6rem' }}>
        {/* Garis Horizontal Background */}
        <div style={{
          position: 'absolute', top: '24px', left: '0', right: '0',
          height: '4px', background: 'var(--color-border)', zIndex: 1,
          borderRadius: '4px'
        }}></div>

        <div className="timeline-scroll">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="timeline-item-wrapper" style={{ textAlign: 'center' }}>
              <div className="step-circle">{idx + 1}</div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>{step.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-alt" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 className="mb-4 text-center">Ringkasan Syarat & Ketentuan Umum</h3>
        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
          <div>
            <h5 className="mb-2" style={{ color: 'var(--color-primary)' }}>Pengangkutan</h5>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Dilakukan setiap hari Kamis (perubahan akan diinfokan). Titik penutupan ember harus tetap.</p>
          </div>
          <div>
            <h5 className="mb-2" style={{ color: 'var(--color-primary)' }}>Pembayaran</h5>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Di awal via transfer bank. Tagihan perpanjangan dikirim 5 hari sebelum masa aktif berakhir.</p>
          </div>
          <div>
            <h5 className="mb-2" style={{ color: 'var(--color-primary)' }}>Pembatalan</h5>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Dapat diajukan kapan saja. Biaya yang sudah dibayarkan bersifat <em>non-refundable</em>.</p>
          </div>
          <div>
            <h5 className="mb-2" style={{ color: 'var(--color-primary)' }}>Kompensasi Alat</h5>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Ember adalah milik TS. Jika rusak berat/hilang, dikenakan biaya kompensasi Rp55.000/ember.</p>
          </div>
        </div>
      </div>

      {showSelectModal && (
        <div className="modal-overlay" onClick={() => setShowSelectModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
              Pilih Jenis Registrasi
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => {
                  setActiveForm('household');
                  setShowSelectModal(false);
                }}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-bg)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h4 style={{ color: 'var(--color-primary-dark)', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                  Registrasi Untuk Rumah Tangga
                </h4>
                <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '0.85rem' }}>
                  Layanan pengangkutan sampah organik mingguan untuk hunian Anda.
                </p>
              </button>

              <button 
                onClick={() => {
                  setActiveForm('business');
                  setShowSelectModal(false);
                }}
                className="card"
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-bg)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h4 style={{ color: 'var(--color-primary-dark)', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                  Registrasi Untuk Bisnis
                </h4>
                <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '0.85rem' }}>
                  Kontrak resmi dengan fasilitas ember lebih banyak & laporan sampah terkelola.
                </p>
              </button>
            </div>

            <button className="modal-close-btn" onClick={() => setShowSelectModal(false)}><X size={20} /></button>
          </div>
        </div>
      )}

      {activeForm === 'household' && <RegistrationForm onClose={() => setActiveForm(null)} />}
      {activeForm === 'business' && <BusinessRegistrationForm onClose={() => setActiveForm(null)} />}
    </section>
  );
}
