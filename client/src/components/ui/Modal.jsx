import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);
  const resolveRef = useRef(null);

  const showModal = useCallback((opts) => {
    return new Promise(resolve => {
      resolveRef.current = resolve;
      setModal(opts);
    });
  }, []);

  const close = (result) => {
    if (resolveRef.current) resolveRef.current(result);
    resolveRef.current = null;
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      {modal && createPortal(
        <div className="ro-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) close(false); }}>
          <div className="ro-modal">
            <div className="ro-modal__title">{modal.title || 'Confirm'}</div>
            <div className="ro-modal__body">{modal.body || modal.message || ''}</div>
            <div className="ro-modal__actions">
              <button className="ro-btn ro-btn--outline" onClick={() => close(false)}>
                {modal.cancelLabel || 'Cancel'}
              </button>
              <button
                className={`ro-btn ${modal.confirmClass || (modal.type === 'danger' ? 'ro-btn--danger' : 'ro-btn--primary')}`}
                onClick={() => {
                  if (modal.onConfirm) modal.onConfirm();
                  close(true);
                }}
              >
                {modal.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
