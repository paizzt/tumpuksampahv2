import { useState } from 'react';
import { Check, Coins, Clock } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import ServiceModal from './ServiceModal';
import MinjelForm from './MinjelForm';

const householdFeatures = [
  'Ember 20L + Tutup',
  'Pick-up 1x sepekan',
  'Layanan Admin Fast-respon',
  '10kg Kompos gratis per 6-bulan',
];

const businessPackages = [
  {
    name: 'STARTER',
    price: 'Rp650Rb',
    tagline: 'Bisnis rumahan & kafe kecil',
    features: ['5 Ember 20L', '1x pick up / pekan', '10Kg Kompos'],
  },
  {
    name: 'GREEN',
    price: 'Rp1.95Jt',
    tagline: 'Homestay, coffeeshop, kantin',
    features: ['10 Ember 20L', '3x pick up / pekan', '25Kg Kompos'],
    popular: true,
  },
  {
    name: 'SUSTAIN',
    price: 'Rp3.25Jt',
    tagline: 'Hotel, restoran, coffeeshop besar',
    features: ['20 Ember 20L', '3x pick up / pekan', 'Laporan Sampah', '50Kg Kompos'],
  },
  {
    name: 'IMPACT',
    price: 'Rp4.5Jt',
    tagline: 'Hotel skala besar & kompleks perumahan',
    features: ['30 Ember 20L', '3x pick up / pekan', 'Laporan Sampah', '75Kg Kompos'],
    dark: true,
  },
];

const services = {
  consult: {
    title: 'Konsultasi Manajemen Sampah',
    description: 'Kami siap membantu bisnis Anda untuk mengelola sampah dengan lebih efektif dan ramah lingkungan',
    action: {
      href: 'https://wa.me/6285796945320',
      label: 'Hubungi Admin via Whatsapp',
      variant: 'primary',
      icon: 'whatsapp',
    },
  },
  edukasi: {
    title: 'Edukasi Lingkungan',
    description: 'Mari berkolaborasi untuk workshop dan sharing session',
    action: {
      href: 'https://wa.me/6285796945320',
      label: 'Hubungi Admin via WhatsApp',
      variant: 'primary',
      icon: 'whatsapp',
    },
  },
  bss: {
    title: 'Bawa Sampah Sendiri (BSS)',
    description: 'Bayar sesuai dengan berat sampahta',
    points: [
      { icon: Coins, label: 'Bayar cuman 3.000/kg' },
      { icon: Clock, label: 'Dibawa hari Kamis jam 8.00–15.30' },
    ],
    action: {
      href: 'https://maps.app.goo.gl/jzcXEKcdtUnsjUxQ6',
      label: 'Tumpuk Sampah di Jl. Malengkeri',
      variant: 'service',
    },
  },
  minjel: {
    title: 'TS MINJEL (Setor Minyak Jelantah)',
    description: 'Daftar dulu ya untuk program ini',
    openForm: true,
    pointsTitle: '4 Titik Setor Minyak Jelantah:',
    points: [
      { label: 'Tumpuk Sampah di Jl. Malengkeri', href: 'https://maps.app.goo.gl/jzcXEKcdtUnsjUxQ6' },
      { label: 'Artani di Jl. Rappocini', href: 'https://maps.app.goo.gl/zGYo7THEde1UVTFL8' },
      { label: 'Toko Buahta\' di BTP', href: 'https://maps.app.goo.gl/PvZwyf6iGCzqqSuo6' },
      { label: 'Villa Mutiara Asri di Summarecon', href: 'https://maps.app.goo.gl/q7MnggKXcwfofJEC6' },
    ],
    note: 'Silahkan ta klik petunjuk google maps alamat yang paling terdekat.',
  },
};

const serviceButtons = [
  { key: 'consult', label: 'Konsultasi Manajemen Sampah' },
  { key: 'edukasi', label: 'Edukasi Lingkungan' },
  { key: 'bss', label: 'Bawa Sampah Sendiri (BSS)' },
  { key: 'minjel', label: 'TS MINJEL (Setor Minyak Jelantah)' },
];

export default function Pricing() {
  const [activeService, setActiveService] = useState(null);
  const [showMinjelForm, setShowMinjelForm] = useState(false);
  const sectionRef = useScrollReveal();
  const householdRef = useScrollReveal();
  const businessRef = useScrollReveal();

  const handleServiceClick = (key) => {
    if (key === 'minjel') {
      setShowMinjelForm(true);
    } else {
      setActiveService(key);
    }
  };

  return (
    <section id="pricing" className="bg-alt">
      <div className="container">
        <div ref={sectionRef} className="scroll-reveal">
          <div className="text-center mb-8">
            <span className="tag">Paket Layanan</span>
            <h2>Harga & Paket Berlangganan</h2>
            <p style={{ color: 'var(--color-text-light)' }}>Pilih paket yang paling sesuai dengan kebutuhan Anda.</p>
          </div>
        </div>

        <div ref={householdRef} className="scroll-reveal">
          <div className="mb-8">
          <h3 className="text-center mb-4">Paket Rumah Tangga</h3>
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', borderTop: '4px solid var(--color-primary)' }}>
            <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Rp150.000 <span style={{ fontSize: '1rem', color: 'var(--color-text-light)', fontWeight: 'normal' }}>/bln</span></h4>
                <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'white', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary-dark)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  ⭐ Promo Spesial: Hanya Rp115.000/bln jika mendaftar bertiga (3 Paket Rumah Tangga)!
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
                  {householdFeatures.map((feature) => (
                    <li key={feature} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Check size={20} color="var(--color-primary)" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: 'var(--color-bg-alt)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                <h5 className="mb-2">Pilihan Durasi</h5>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', color: 'var(--color-text-light)' }}>
                  <li className="mb-1"><strong>3 Bulan:</strong> Rp450.000</li>
                  <li className="mb-1"><strong>6 Bulan:</strong> Rp900.000</li>
                  <li className="mb-1" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>1 Tahun: Rp1.620.000 (Hemat 10%)</li>
                </ul>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontStyle: 'italic', marginBottom: 0 }}>
                  *Minimal pembayaran awal 3 bulan.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div ref={businessRef} className="scroll-reveal">
          <h3 className="text-center mb-4">Paket Bisnis</h3>
          <p className="text-center mb-5" style={{ color: 'var(--color-text-light)', fontStyle: 'italic', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Wajib diikat dengan kontrak kerja resmi. Harga spesial tersedia untuk langganan 1 tahun.
          </p>
          <div className="pricing-scroll">
            {businessPackages.map((pkg, index) => (
              <div
                key={pkg.name}
                className="card text-center"
                style={{
                  padding: '1.5rem',
                  transitionDelay: `${index * 100}ms`,
                  ...(pkg.popular && { border: '2px solid var(--color-primary)' }),
                  ...(pkg.dark && { background: 'var(--color-primary-dark)', color: 'white' }),
                }}
              >
                {pkg.popular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    POPULER
                  </div>
                )}
                <h4 style={{ color: pkg.dark ? 'white' : 'var(--color-primary-dark)' }}>{pkg.name}</h4>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0' }}>
                  {pkg.price}<span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>/bln</span>
                </p>
                <p style={{ fontSize: '0.85rem', color: pkg.dark ? 'rgba(255,255,255,0.8)' : 'var(--color-text-light)', height: '40px' }}>{pkg.tagline}</p>
                <hr style={{ margin: '1rem 0', borderColor: pkg.dark ? 'rgba(255,255,255,0.2)' : 'var(--color-border)' }} />
                {pkg.features.map((feature) => (
                  <p key={feature} style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{feature}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center" style={{ marginTop: '4rem' }}>
          <h4 className="mb-3">Layanan Tambahan Lainnya:</h4>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {serviceButtons.map((btn) => (
              <span key={btn.key} className="service-btn" onClick={() => handleServiceClick(btn.key)}>
                {btn.label}
              </span>
            ))}
          </div>
        </div>

        {activeService && (
          <ServiceModal
            service={services[activeService]}
            onClose={() => setActiveService(null)}
          />
        )}

        {showMinjelForm && (
          <MinjelForm onClose={() => setShowMinjelForm(false)} />
        )}
      </div>
    </section>
  );
}
