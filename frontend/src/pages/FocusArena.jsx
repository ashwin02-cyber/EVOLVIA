import React from 'react';
import { Target, Play, Pause, RotateCcw, CheckCircle2, Flame, Award, Headphones } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CircularTimer from '../components/ui/CircularProgress';
import { useFocus } from '../context/FocusContext';

export const FocusArena = () => {
  const {
    mode,
    plannedSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    selectMode,
    startSession,
    pauseSession,
    resumeSession,
    abandonSession,
    completeSession
  } = useFocus();

  const MODES = [
    { id: 'POMODORO', label: 'Pomodoro', mins: 25 },
    { id: 'DEEP_WORK', label: 'Deep Work', mins: 50 },
    { id: 'STUDY', label: 'Study Sprint', mins: 45 },
    { id: 'CUSTOM', label: 'Custom', mins: 30 },
  ];

  const handleToggle = () => {
    if (!isRunning) {
      startSession();
    } else if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <span>Focus Arena</span>
          <Target className="w-6 h-6 text-cyan" />
        </h1>
        <p className="text-xs text-text-2">
          Eliminate distractions. Enter flow state. Earn progression XP.
        </p>
      </div>

      {/* Main Focus Dial Card */}
      <Card className="p-8 lg:p-12 flex flex-col items-center justify-center text-center bg-[#0C061A]/90 border-amethyst/60 shadow-[0_0_40px_rgba(59,10,107,0.4)]">
        {/* Mode selector pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => selectMode(m.id)}
              disabled={isRunning}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                mode === m.id
                  ? 'bg-cyan text-jet shadow-glow-cyan-sm'
                  : 'bg-white/[0.04] text-text-2 hover:bg-white/[0.08] hover:text-white border border-white/10'
              }`}
            >
              {m.label} ({m.mins}m)
            </button>
          ))}
        </div>

        {/* Large Timer Dial */}
        <div className="my-4">
          <CircularTimer
            seconds={remainingSeconds}
            totalSeconds={plannedSeconds}
            isRunning={isRunning}
            isPaused={isPaused}
            onToggle={handleToggle}
            size={220}
            strokeWidth={8}
            subtitle={isRunning ? (isPaused ? 'Paused' : 'Flow Active') : 'Ready'}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-8">
          <Button
            variant={isRunning && !isPaused ? 'ghost' : 'primary'}
            size="lg"
            icon={isRunning && !isPaused ? Pause : Play}
            onClick={handleToggle}
          >
            {isRunning ? (isPaused ? 'Resume Session' : 'Pause') : 'Engage Focus'}
          </Button>

          {isRunning && (
            <Button
              variant="danger"
              size="lg"
              icon={RotateCcw}
              onClick={abandonSession}
            >
              Abandon
            </Button>
          )}
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3 bg-surface-1 border-amethyst/30">
          <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/40 flex items-center justify-center text-cyan">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">4 Sessions</div>
            <div className="text-xs text-text-3">Completed Today</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-surface-1 border-amethyst/30">
          <div className="w-10 h-10 rounded-xl bg-amethyst/30 border border-amethyst/60 flex items-center justify-center text-purple-300">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">100 Mins</div>
            <div className="text-xs text-text-3">Total Time in Flow</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-surface-1 border-amethyst/30">
          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-cyan">+166 XP</div>
            <div className="text-xs text-text-3">Earned from Focus</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FocusArena;
