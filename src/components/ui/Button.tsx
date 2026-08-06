import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'secondary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  
  const variants = {
    primary: 'bg-indigo-600 text-white border-transparent hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    secondary: 'bg-[#1a1a2e] text-[#e8e8f0] border-[#2a2a45] hover:bg-[#252542] hover:border-indigo-500/50',
    danger: 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        'relative inline-flex items-center justify-center font-semibold rounded-xl border transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
