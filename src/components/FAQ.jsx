import { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="card" 
      style={{ 
        padding: '1.5rem', 
        cursor: 'pointer', 
        userSelect: 'none',
        borderLeft: isOpen ? '4px solid var(--color-primary)' : '1px solid var(--color-border)',
        transform: isOpen ? 'translateY(-2px)' : 'none',
        boxShadow: isOpen ? '0 10px 20px rgba(0,0,0,0.05)' : 'none'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h4 style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', margin: 0 }}>{question}</h4>
        <div style={{ 
          background: 'var(--color-bg-alt)', 
          borderRadius: '50%', 
          padding: '4px',
          display: 'flex',
          transition: 'transform 0.3s'
        }}>
          {isOpen ? <ChevronUp size={20} color="var(--color-primary)" /> : <ChevronDown size={20} color="var(--color-primary)" />}
        </div>
      </div>
      {isOpen && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-text-light)', margin: 0 }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const sectionRef = useScrollReveal();
  const storiesRef = useScrollReveal();
  const faqRef = useScrollReveal();

  const faqData = [
    {
      question: "Sampah organiknya dikelola jadi apa?",
      answer: "Jadi kompos yang bisa dipakai untuk tanaman."
    },
    {
      question: "Mau ikut menerapkan sustainability living mulai dari mana?",
      answer: "Mulai dari riset kemampuan diri dan mulai dengan yang paling mudah untuk diterapkan seperti mulai pakai tumbler pengganti air kemasan sekali pakai, mulai pilah sampah dan dikelola."
    },
    {
      question: "Kalau penjemputan sepekan 1x supaya sampahnya ga bau bagaimana?",
      answer: "Siapkan wadah khusus dan tutup rapat."
    }
  ];

  return (
    <section className="bg-alt">
      <div className="container">
        <div ref={sectionRef} className="scroll-reveal">
          <div className="text-center mb-8">
            <span className="tag">Cerita Warga & FAQ</span>
            <h2>Apa Kata Mereka & Pertanyaan Umum</h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', maxWidth: '800px', margin: '0 auto' }}>
          <div ref={storiesRef} className="scroll-reveal">
            <h3 className="mb-4">Cerita Warga</h3>
            <div className="card mb-4">
              <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"Awalnya melihat sampah produksi yang banyak. Lingkungan tempat kerja jadi lebih bersih dan sampah tidak berbau tajam lagi."</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="avatar-circle"><MessageCircle size={20} color="var(--color-primary-dark)"/></div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Nathali</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Generasi ke-2 dari Mama Toko Kue</p>
                </div>
              </div>
            </div>
            <div className="card">
              <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"Saya sadar ada banyak sekali sampah dapur tapi tidak punya waktu dan lahan yang memadai. Benefit yang paling saya rasakan itu area sampah didalam rumah itu tidak bau dan lebih mudah dibersihkan. Kemudian ada rasa senang karena sampah yang saya hasilkan bisa bermanfaat."</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="avatar-circle"><MessageCircle size={20} color="var(--color-primary-dark)"/></div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Erma</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Berlangganan sejak Agustus 2024</p>
                </div>
              </div>
            </div>
          </div>

          <div ref={faqRef} className="scroll-reveal">
            <h3 className="mb-4">FAQ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqData.map((faq, index) => (
                <AccordionItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
