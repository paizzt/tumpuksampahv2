import useScrollReveal from '../hooks/useScrollReveal';

export default function About() {
  const sectionRef = useScrollReveal();

  return (
    <section id="about" className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
      <div ref={sectionRef} className="scroll-reveal">
        <div className="text-center mb-8">
          <span className="tag">Profil Perusahaan</span>
          <h2>Tentang Tumpuk Sampah</h2>
          <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--color-text-light)' }}>
            Tumpuk Sampah (TS) adalah sebuah layanan kebersihan inovatif yang berfokus pada jasa pengolahan sampah organik langsung dari sumbernya. Kami hadir sebagai solusi nyata bagi warga perkotaan yang ingin bertanggung jawab atas limbah yang dihasilkan, sekaligus menekan volume sampah yang berakhir di Tempat Pembuangan Akhir (TPA).
          </p>
        </div>
        
        <div className="grid grid-cols-2">
          <div className="card">
            <h3 style={{ color: 'var(--color-primary)' }}>Visi Kami</h3>
            <p>Menciptakan alur persampahan yang berkelanjutan (sustainability) demi mengurangi penumpukan sampah di TPA serta menekan emisi gas rumah kaca.</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--color-primary)' }}>Misi Kami</h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text)' }}>
              <li className="mb-2">Menyediakan sistem pengelolaan sampah organik yang praktis dan mudah diaplikasikan oleh masyarakat perkotaan.</li>
              <li>Membangun komunikasi yang berkualitas dan interaktif dengan warga demi kesadaran lingkungan yang lebih baik.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
