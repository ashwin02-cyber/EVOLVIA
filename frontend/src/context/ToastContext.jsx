import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => {
      const now = Date.now();
      // Deduplicate recent identical toasts within 1500ms
      const isDuplicate = prev.some(
        (t) => t.title === toast.title && t.message === toast.message && (now - (t.createdAt || 0)) < 1500
      );
      if (isDuplicate) return prev;

      const id = now + Math.random().toString();
      const newToast = {
        id,
        createdAt: now,
        type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
        title: toast.title,
        message: toast.message,
        duration: toast.duration || 4000,
      };

      if (newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return [...prev, newToast];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (title, message) => addToast({ type: 'success', title, message });
  const error = (title, message) => addToast({ type: 'error', title, message });
  const warning = (title, message) => addToast({ type: 'warning', title, message });
  const info = (title, message) => addToast({ type: 'info', title, message });

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarn = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto p-4 rounded-xl flex items-start gap-3 border shadow-glass backdrop-blur-md ${
                  isSuccess
                    ? 'bg-jet/90 border-cyan/40 text-text-1'
                    : isError
                    ? 'bg-jet/90 border-danger/40 text-text-1'
                    : isWarn
                    ? 'bg-jet/90 border-gold/40 text-text-1'
                    : 'bg-jet/90 border-amethyst/40 text-text-1'
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-cyan shrink-0 mt-0.5" />}
                {isError && <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />}
                {isWarn && <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />}
                {!isSuccess && !isError && !isWarn && <Info className="w-5 h-5 text-cyan shrink-0 mt-0.5" />}

                <div className="flex-1 min-w-0">
                  {toast.title && <div className="font-semibold text-sm">{toast.title}</div>}
                  {toast.message && <div className="text-xs text-text-2 mt-0.5">{toast.message}</div>}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-text-3 hover:text-text-1 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
