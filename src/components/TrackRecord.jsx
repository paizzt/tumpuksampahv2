import { TrendingUp, Users } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import useCountUp from '../hooks/useCountUp';
import logoMama from '../assets/logo-mama.jpg';
import logoCitraGarden from '../assets/logo-citra-garden.jpg';
import logoRappo from '../assets/logo-rappo.jpg';
import logoDlhMakassar from '../assets/logo-dlh-makassar.jpg';
import logoSentra from '../assets/logo-sentra.jpg';
import logoSofi from '../assets/logo-sofi.jpg';
import logoNo5 from '../assets/logo-no5.jpg';

function StatCard({ icon: Icon, end, suffix = '', label }) {
  const { ref, count } = useCountUp(end, 2000);

  return (
    <div className="card text-center stat-card" ref={ref}>
      <div className="icon-circle" style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
        <Icon size={40} />
      </div>
      <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{count}{suffix}</h3>
      <p style={{ color: 'var(--color-text-light)', fontWeight: '500' }}>{label}</p>
    </div>
  );
}

export default function TrackRecord() {
  const sectionRef = useScrollReveal();
  const logosRef = useScrollReveal();

  return (
    <section className="bg-alt">
      <div className="container">
        <div ref={sectionRef} className="scroll-reveal">
          <div className="text-center mb-8">
            <span className="tag">Rekam Jejak & Dampak</span>
            <h2>Dampak & Catatan Sejarah Kami</h2>
            <p style={{ color: 'var(--color-text-light)' }}>Bersama klien & mitra dari berbagai kalangan, kami terus berupaya menciptakan dampak positif.</p>
          </div>

          <div className="grid grid-cols-2 mb-8">
            <StatCard icon={TrendingUp} end={12} suffix="+" label="Ton Sampah Terkelola" />
            <StatCard icon={Users} end={360} label="Orang Teredukasi" />
          </div>
        </div>

        <div ref={logosRef} className="scroll-reveal">
          <div className="card" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Klien & Mitra Percaya Kami</h4>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', fontWeight: '600', fontSize: '1.2rem', color: 'var(--color-text-light)' }}>
              <img src={logoMama} alt="Mama" loading="lazy" decoding="async" style={{ maxHeight: '120px' }} />
              <img src={logoCitraGarden} alt="Citra Garden" loading="lazy" decoding="async" style={{ maxHeight: '120px' }} />
              <img src={logoRappo} alt="Rappo" loading="lazy" decoding="async" style={{ maxHeight: '120px' }} />
              <img src={logoDlhMakassar} alt="DLH Makassar" loading="lazy" decoding="async" style={{ maxHeight: '120px' }} />
              <img src={logoSentra} alt="Sentra" loading="lazy" decoding="async" style={{ maxHeight: '120px' }} />
              <img src={logoSofi} alt="Sofi" loading="lazy" decoding="async" style={{ maxHeight: '120px' }} />
              <img src={logoNo5} alt="No5" loading="lazy" decoding="async" style={{ maxHeight: '120px' }} />
            </div>
            <hr style={{ margin: '2rem 0', borderColor: 'var(--color-border)' }} />
            <div>
              <h4 className="mb-2">Jangkauan Area Operasional</h4>
              <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>Kota Makassar</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
