import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glass?: boolean;
}

export function Card({ children, glass = true, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        glass ? 'glass-card' : 'bg-[#141414] border border-white/8 rounded-2xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
