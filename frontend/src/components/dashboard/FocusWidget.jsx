import React from 'react';
import { Target } from 'lucide-react';
import Card from '../ui/Card';
import CircularTimer from '../ui/CircularProgress';
import focusDeskImg from '../../assets/images/focus_desk.png';
import { useFocus } from '../../context/FocusContext';

export const FocusWidget = ({ onOpenFocusPage }) => {
  const {
    mode,
    plannedSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    selectMode,
    startSession,
    pauseSession,
    resumeSession
  } = useFocus();

  const handleToggle = () => {
    if (!isRunning) {
      startSession();
    } else if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const MODES = [
    { id: 'POMODORO', label: 'Pomodoro' },
    { id: 'DEEP_WORK', label: 'Deep Work' },
    { id: 'STUDY', label: 'Study' },
    { id: 'CUSTOM', label: 'Custom' }
  ];

  return (
    <Card className="relative p-5 flex flex-col justify-between h-full bg-[#0B0615]/80 border-amethyst/40 overflow-hidden">
      {/* Background Study Desk Artwork with Dark Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-30 mix-blend-luminosity">
        <img
          src={focusDeskImg}
          alt="Focus Desk Atmosphere"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0615] via-[#0B0615]/80 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Focus Arena
              </h2>
              <p className="text-[10px] text-text-3">Stay focused. Earn XP.</p>
            </div>
          </div>
        </div>

        {/* Circular Countdown Timer */}
        <div className="flex justify-center my-2">
          <CircularTimer
            seconds={remainingSeconds}
            totalSeconds={plannedSeconds}
            isRunning={isRunning}
            isPaused={isPaused}
            onToggle={handleToggle}
            size={130}
            strokeWidth={5}
            subtitle={mode === 'POMODORO' ? 'Focus Mode' : mode}
          />
        </div>
      </div>

      {/* Mode Chips along bottom */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-white/[0.05]">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => selectMode(m.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 text-center select-none ${
                isActive
                  ? 'bg-cyan text-jet font-semibold shadow-glow-cyan-sm'
                  : 'bg-white/[0.04] text-text-2 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default FocusWidget;
