import { X, MessageCircle } from 'lucide-react';

export default function ServiceModal({ service, onClose }) {
  if (!service) return null;

  const { title, description, action } = service;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>{title}</h3>
        <p style={{ margin: '1rem 0', color: 'var(--color-text-light)' }}>{description}</p>

        {service.points && (
          <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {service.points.map((point, idx) => {
              if (point.href) {
                return (
                  <a
                    key={idx}
                    href={point.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="service-btn"
                    style={{ textAlign: 'left' }}
                  >
                    {point.label}
                  </a>
                );
              }
              if (point.icon) {
                const Icon = point.icon;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--color-primary-light)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={18} color="var(--color-primary-dark)" />
                    </div>
                    <span style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>{point.label}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {action && (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={action.variant === 'service' ? 'service-btn' : 'btn btn-primary'}
            style={action.variant === 'service'
              ? { textAlign: 'left', display: 'inline-block', marginTop: '0.5rem' }
              : { fontSize: '0.9rem', padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
          >
            {action.icon === 'whatsapp' && <MessageCircle size={18} />}
            {action.label}
          </a>
        )}

        {service.note && (
          <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
            {service.note}
          </p>
        )}

        <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
      </div>
    </div>
  );
}
