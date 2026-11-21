import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`relative rounded-2xl bg-[#0B0614]/75 backdrop-blur-xl border border-amethyst/40 shadow-glass transition-all duration-300 overflow-hidden ${
        hoverEffect ? 'hover:border-cyan/40 hover:-translate-y-0.5 hover:shadow-glass-lift' : ''
      } ${glow ? 'shadow-[0_0_25px_rgba(59,10,107,0.5)] border-amethyst/80' : ''} ${className}`}
      {...props}
    >
      {/* Subtle top inner highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export default Card;
