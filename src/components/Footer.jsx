import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const InstagramIcon = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <path d="m10 15 5-3-5-3z"/>
  </svg>
);

export default function Footer({ onStartSubscription }) {
  const ctaRef = useScrollReveal();
  const linksRef = useScrollReveal();

  return (
    <footer style={{ background: 'var(--color-text)', color: 'white', paddingTop: '4rem', paddingBottom: '2rem', position: 'relative' }}>
      <div className="container">
        
        {/* Call to Action Box */}
        <div ref={ctaRef} className="scroll-reveal">
          <div style={{ 
            background: 'var(--color-primary-dark)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '4rem 2rem', 
            textAlign: 'center',
            marginBottom: '5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>Mari Mulai Langkah Baik Ini</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-primary-light)', fontStyle: 'italic', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: '1.8' }}>
              "Semakin banyak sampah yang dihasilkan, semakin besar tanggung jawab kita atau biaya yang harus dikeluarkan. Kata kuncinya ada pada TANGGUNG JAWAB."
            </p>
            <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Jangan ragu untuk memulai langkah baik ini untuk lingkungan kita. Bagikan juga informasi ini ke komunitas or grup perumahan Anda!
            </p>
            <button 
              className="btn" 
              style={{ background: 'white', color: 'var(--color-primary-dark)' }}
              onClick={onStartSubscription}
            >
              Mulai Berlangganan <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Footer Links & Info */}
        <div ref={linksRef} className="scroll-reveal">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '4rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
          
          <div>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tumpuk Sampah</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
              Solusi inovatif pengelolaan sampah organik rumah tangga dan bisnis perkotaan untuk bumi yang lebih sehat dan berkelanjutan.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Lokasi & Kontak</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                <MapPin size={20} color="var(--color-primary-light)" style={{ flexShrink: 0, marginTop: '4px' }} /> 
                <span>Jl. Mallengkeri, Makassar</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                <Phone size={20} color="var(--color-primary-light)" style={{ flexShrink: 0 }} /> 
                <a href="https://wa.me/6285796945320" target="_blank" rel="noopener noreferrer" className="footer-link">0857-9694-5320</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Sosial Media</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                <InstagramIcon size={20} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
                <a href="https://www.instagram.com/tumpuksampah/" target="_blank" rel="noopener noreferrer" className="footer-link">@tumpuksampah</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                <YoutubeIcon size={20} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
                <a href="https://www.youtube.com/@tumpuksampah" target="_blank" rel="noopener noreferrer" className="footer-link">Tumpuk Sampah</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                <Mail size={20} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
                <a href="mailto:tumpuksampahh@gmail.com" className="footer-link">tumpuksampahh@gmail.com</a>
              </li>
            </ul>
          </div>

          </div>

          {/* Copyright */}
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.4)', 
            fontSize: '0.9rem',
            marginTop: '2rem'
          }}>
            &copy; {new Date().getFullYear()} Tumpuk Sampah (TS). All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
