import { useEffect, useRef } from 'react';
import { ArrowRight, Recycle } from 'lucide-react';
import heroBg from '../assets/hero1.jpg';

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      if (sectionRef.current) {
        sectionRef.current.style.backgroundPositionY = `${window.scrollY * 0.5}px`;
      }
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      style={{
        minHeight: '95vh',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `linear-gradient(rgba(45, 42, 38, 0.7), rgba(45, 42, 38, 0.85)), url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center 0px',
        paddingTop: '0',
        paddingBottom: '0',
        position: 'relative',
        color: 'white'
      }}
    >
      <div className="container text-center animate-fade-up" style={{ position: 'relative', zIndex: 2 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1.5rem',
          background: 'transparent',
          border: '1px solid white',
          color: 'white',
          borderRadius: '50px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontSize: '0.85rem'
        }}>
          Start New Habits <Recycle size={16} />
        </span>

        <h1 className="mb-4" style={{ maxWidth: '900px', margin: '0 auto 1.5rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
          Tumpuk Sampah (TS)
        </h1>

        <p className="mb-5" style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', maxWidth: '650px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
          Jadi teman perjalanan untuk sustainability. Layanan kebersihan inovatif untuk pengolahan sampah organik langsung dari sumbernya.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            className="btn"
            style={{ background: 'white', color: 'var(--color-text)', border: 'none' }}
            onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
          >
            Lihat Layanan <ArrowRight size={20} />
          </button>

        </div>
      </div>
    </section>
  );
}
