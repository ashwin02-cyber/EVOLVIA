import React from 'react';

export const Badge = ({
  children,
  variant = 'cyan', // 'cyan' | 'amethyst' | 'gold' | 'success' | 'outline'
  size = 'sm',
  className = '',
  icon: Icon
}) => {
  const variantStyles = {
    cyan: 'bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]',
    amethyst: 'bg-amethyst/30 text-purple-200 border border-amethyst/70',
    gold: 'bg-gold/15 text-gold border border-gold/40 shadow-[0_0_8px_rgba(255,200,87,0.2)]',
    success: 'bg-success/15 text-success border border-success/40',
    outline: 'bg-transparent text-text-2 border border-white/10',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider uppercase',
    sm: 'text-xs px-2.5 py-1 rounded-md font-medium',
    md: 'text-sm px-3 py-1.5 rounded-lg font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
