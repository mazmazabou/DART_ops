import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      const el = document.createElement('div');
      el.className = 'ro-toast';
      document.body.appendChild(el);
      containerRef.current = el;
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.remove();
        containerRef.current = null;
      }
    };
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type, fading: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const icons = { success: '\u2713', error: '\u2715', info: '\u2139' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {containerRef.current && createPortal(
        toasts.map(t => (
          <div
            key={t.id}
            className={`ro-toast-item ro-toast-item--${t.type}`}
            style={t.fading ? { opacity: 0, transform: 'translateY(10px)', transition: 'all 0.3s' } : undefined}
          >
            <span>{icons[t.type] || '\u2139'}</span> {t.message}
          </div>
        )),
        containerRef.current
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
