import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) => {
  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = shouldReduceMotion;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-[#0D0818]/95 border border-amethyst/70 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl z-10 overflow-hidden ${className}`}
          >
            {/* Top ambient glow line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amethyst via-cyan to-amethyst opacity-80" />

            <div className="flex items-start justify-between mb-5">
              <div>
                {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                {subtitle && <p className="text-xs text-text-2 mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-text-3 hover:text-cyan transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
