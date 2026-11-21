import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import LevelHexagon from '../ui/LevelHexagon';
import Button from '../ui/Button';

export const LevelUpOverlay = ({
  levelUpData, // { from: 11, to: 12, crystals_awarded: 5, rank: 'Productivity Explorer' }
  onClose
}) => {
  useEffect(() => {
    if (levelUpData) {
      // Cyberpunk particle burst with cyan and purple confetti
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00E5FF', '#3B0A6B', '#7B3FCF', '#FFFFFF']
        });
      } catch (e) {
        // ignore
      }
    }
  }, [levelUpData]);

  if (!levelUpData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-10 w-full max-w-sm rounded-3xl bg-[#0D071D] border-2 border-cyan/70 p-7 text-center shadow-[0_0_50px_rgba(0,229,255,0.4)] overflow-hidden"
        >
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan/20 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="text-xs uppercase tracking-[0.25em] font-bold text-cyan text-glow-cyan mb-2">
            Progression Milestone
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-6">
            LEVEL UP!
          </h2>

          {/* Hexagon Level */}
          <div className="flex justify-center my-4">
            <LevelHexagon level={levelUpData.to} size={100} />
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold text-text-1">
              Rank: <span className="text-cyan">{levelUpData.rank || 'Productivity Explorer'}</span>
            </div>
            {levelUpData.crystals_awarded > 0 && (
              <div className="text-xs text-purple-300 font-mono mt-1">
                +{levelUpData.crystals_awarded} Crystals Awarded 💎
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full mt-6 shadow-glow-cyan-md"
          >
            Claim & Continue
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpOverlay;
