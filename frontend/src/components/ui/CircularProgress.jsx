import React from 'react';
import { Play, Pause } from 'lucide-react';

export const CircularTimer = ({
  seconds = 1500,
  totalSeconds = 1500,
  isRunning = false,
  isPaused = false,
  onToggle,
  size = 140,
  strokeWidth = 6,
  subtitle = 'Focus Mode',
  className = '',
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (totalSeconds - seconds) / totalSeconds : 0;
  // Arc dash offset (drawing from top)
  const strokeDashoffset = circumference - (1 - progress) * circumference;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="timerCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4DF3FF" />
            <stop offset="100%" stop-color="#00E5FF" />
          </linearGradient>
          <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#timerCyanGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#timerGlow)"
          className="transition-all duration-500 ease-linear"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold font-mono tracking-tight text-white leading-none">
          {formatTime(seconds)}
        </span>
        <span className="text-[11px] text-text-2 mt-1 leading-none">
          {subtitle}
        </span>

        {/* Center play / pause button */}
        <button
          onClick={onToggle}
          className="mt-2 w-8 h-8 rounded-full bg-cyan text-jet flex items-center justify-center shadow-glow-cyan-sm hover:scale-110 active:scale-95 transition-all duration-200"
          aria-label={isRunning && !isPaused ? 'Pause' : 'Play'}
        >
          {isRunning && !isPaused ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CircularTimer;
