import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        'bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl',
        hoverable && 'cursor-pointer hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
