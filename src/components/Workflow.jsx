import { UserPlus, Recycle, Gift, CheckCircle, XCircle } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import workflowImg1 from '../assets/workflow1-rev.jpg';
import workflowImg2 from '../assets/workflow-img-2.jpg';

export default function Workflow() {
  const sectionRef = useScrollReveal();
  const stepsRef = useScrollReveal();
  const sortingRef = useScrollReveal();

  return (
    <section className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
      <div ref={sectionRef} className="scroll-reveal">
        <div className="text-center mb-8">
          <span className="tag">Layanan Utama</span>
          <h2>Alur Kerja Kami</h2>
          <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--color-text-light)' }}>
            Kami menyediakan layanan pengangkutan rutin skala rumah tangga dan bisnis. Sampah organik yang dikumpulkan akan diproses melalui metode pengomposan alami menggunakan mikroorganisme (bakteri), dan hasilnya akan dikembalikan kepada Anda.
          </p>
        </div>
      </div>

      <div ref={stepsRef} className="scroll-reveal">
        <div className="grid grid-cols-3 mb-8">
          <div className="card text-center">
            <div className="icon-circle" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
              <UserPlus size={32} />
            </div>
            <h3 className="mb-2">1. Registrasi</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)' }}>Daftar dan kami antarkan ember ke lokasi Anda.</p>
          </div>
          <div className="card text-center">
            <div className="icon-circle" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
              <Recycle size={32} />
            </div>
            <h3 className="mb-2">2. Pilah Sampah</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)' }}>Masukkan sisa organikmu ke dalam Ember TS.</p>
          </div>
          <div className="card text-center">
            <div className="icon-circle" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
              <Gift size={32} />
            </div>
            <h3 className="mb-2">3. Terima Kompos</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)' }}>Hasil kompos akan dikembalikan untuk menyuburkan tanamanmu.</p>
          </div>
        </div>
      </div>

      <div ref={sortingRef} className="scroll-reveal">
        <div className="card bg-alt" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 className="text-center mb-5">Cara Pemilahan Sampah (Ember TS)</h3>
          <p className="text-center mb-5" style={{ color: 'var(--color-text-light)' }}>Untuk menjaga kualitas kompos, perhatikan panduan material berikut:</p>

          <div className="grid grid-cols-2">
            <div className="sorting-box can">
              <img src={workflowImg1} alt="Contoh sampah organik" loading="lazy" decoding="async" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '1rem' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                <CheckCircle size={24} /> BISA MASUK EMBER
              </div>
              <p style={{ fontSize: '0.95rem' }}>Sisa buah & sayur, cangkang telur, sisa daging, ampas kopi, sisa nasi, kulit kacang, dan semua jenis roti.</p>
            </div>

            <div className="sorting-box cannot">
              <img src={workflowImg2} alt="Contoh sampah non-organik" loading="lazy" decoding="async" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '1rem' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                <XCircle size={24} /> TIDAK BISA MASUK
              </div>
              <p style={{ fontSize: '0.95rem' }}>Semua jenis plastik kemasan, kain, tisu, baterai, kardus, segala jenis kemasan kertas, kaca, popok, dan bungkus nasi.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
