import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_28px_rgba(16,185,129,0.45)]',
  secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
  ghost:     'bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white',
  danger:    'bg-red-600 hover:bg-red-500 text-white font-semibold',
  success:   'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold',
};

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 cursor-pointer',
        'transition-all duration-150 ease-out',
        'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
