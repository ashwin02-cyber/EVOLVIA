import React from 'react';

export const LevelHexagon = ({ level = 12, size = 64, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg
        viewBox="0 0 100 115"
        className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(123,63,207,0.7)]"
      >
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3B0A6B" />
            <stop offset="100%" stop-color="#120526" />
          </linearGradient>
          <linearGradient id="hexBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7B3FCF" />
            <stop offset="50%" stop-color="#00E5FF" />
            <stop offset="100%" stop-color="#3B0A6B" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon */}
        <polygon
          points="50,2 96,27 96,88 50,113 4,88 4,27"
          fill="url(#hexGrad)"
          stroke="url(#hexBorderGrad)"
          strokeWidth="3"
        />

        {/* Inner Hexagon Detail */}
        <polygon
          points="50,10 88,32 88,83 50,105 12,83 12,32"
          fill="none"
          stroke="#7B3FCF"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>

      {/* Level text */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-text-2 leading-none mb-0.5">
          Level
        </span>
        <span className="text-xl font-bold font-mono text-white text-glow-cyan leading-none">
          {level}
        </span>
      </div>
    </div>
  );
};

export default LevelHexagon;
