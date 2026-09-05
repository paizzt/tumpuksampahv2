import logo from '../assets/logo.png';

export default function Header() {
  return (
    <header style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      padding: '1.5rem 0', 
      zIndex: 10 
    }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            background: 'white', 
            padding: '0.5rem', 
            borderRadius: 'var(--radius-sm)',
            display: 'inline-flex',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <img src={logo} alt="Tumpuk Sampah Logo" style={{ height: '60px', width: 'auto' }} />
          </div>
        </div>
      </div>
    </header>
  );
}
