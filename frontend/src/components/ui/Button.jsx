import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'ghost' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.97] rounded-xl';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl font-semibold',
  };

  const variantStyles = {
    // Primary: Solid Electric Cyan, black text, neon glow
    primary: 'bg-cyan text-jet font-semibold shadow-glow-cyan-sm hover:bg-[#33EBFF] hover:shadow-glow-cyan-md hover:-translate-y-0.5 border border-cyan',
    // Ghost: Dark glass, 1px amethyst border, light text, cyan hover
    ghost: 'bg-[#0B0614]/80 text-text-1 border border-amethyst/60 hover:border-cyan/60 hover:text-cyan hover:shadow-glow-cyan-sm hover:-translate-y-0.5 backdrop-blur-md',
    // Outline: Transparent with cyan border & glow
    outline: 'bg-transparent text-cyan border border-cyan/70 hover:bg-cyan/10 hover:border-cyan hover:shadow-glow-cyan-sm hover:-translate-y-0.5',
    // Danger: Red glass
    danger: 'bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 hover:border-danger hover:shadow-[0_0_15px_rgba(255,77,109,0.4)]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
