import { useEffect, useRef } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA'; // Cloudflare official test key (Always Passes)

export default function TurnstileWidget({ onVerify, onExpire, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      // Clean up any existing widget instance in this container
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            if (isMounted && onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (isMounted && onExpire) onExpire();
          },
          'error-callback': () => {
            if (isMounted && onError) onError();
          },
          theme: 'light',
          size: 'flexible',
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.error('Error rendering Cloudflare Turnstile:', err);
      }
    };

    // If script is not yet added, load it
    if (!document.getElementById(TURNSTILE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          renderWidget();
        }
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    } else {
      // If script is loading, wait for turnstile object
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
      <div ref={containerRef} style={{ width: '100%', maxWidth: '300px', minHeight: '65px' }} />
    </div>
  );
}
