import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from './Button'; // reuse utility

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  accentColor?: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'red';
}

export function TiltCard({ children, className, onClick, accentColor = 'emerald' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || prefersReducedMotion) {
      return; // Fallback to CSS hover on mobile
    }

    const card = cardRef.current;
    const gloss = glossRef.current;
    if (!card || !gloss) return;

    const xTo = gsap.quickTo(card, 'rotationY', { duration: 0.3, ease: 'power2.out' });
    const yTo = gsap.quickTo(card, 'rotationX', { duration: 0.3, ease: 'power2.out' });
    
    // Gloss shift
    const glossXTo = gsap.quickTo(gloss, 'x', { duration: 0.3, ease: 'power2.out' });
    const glossYTo = gsap.quickTo(gloss, 'y', { duration: 0.3, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);
      
      // Max 8deg tilt
      xTo(percentX * 8);
      yTo(percentY * -8);
      
      // Gloss moves opposite
      glossXTo(percentX * -20);
      glossYTo(percentY * -20);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      glossXTo(0);
      glossYTo(0);
      gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseEnter = () => {
      gsap.to(card, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseDown = () => {
      gsap.to(card, { scale: 0.97, duration: 0.1, ease: 'power2.out' });
    };

    const handleMouseUp = () => {
      gsap.to(card, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousedown', handleMouseDown);
    card.addEventListener('mouseup', handleMouseUp);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mousedown', handleMouseDown);
      card.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const accentStyles = {
    emerald: 'hover:border-emerald-500/30 hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.15)]',
    sky: 'hover:border-sky-500/30 hover:shadow-[0_20px_40px_-12px_rgba(14,165,233,0.15)]',
    amber: 'hover:border-amber-500/30 hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.15)]',
    violet: 'hover:border-violet-500/30 hover:shadow-[0_20px_40px_-12px_rgba(139,92,246,0.15)]',
    rose: 'hover:border-rose-500/30 hover:shadow-[0_20px_40px_-12px_rgba(244,63,94,0.15)]',
    red: 'hover:border-red-500/30 hover:shadow-[0_20px_40px_-12px_rgba(239,68,68,0.15)]',
  };

  return (
    <div style={{ perspective: '1000px' }} className="h-full">
      <div
        ref={cardRef}
        onClick={onClick}
        className={cn(
          "relative w-full h-full glass-card overflow-hidden transition-colors cursor-pointer group active:scale-97 transform-gpu",
          accentStyles[accentColor],
          className
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Background base */}
        <div className="absolute inset-0 bg-[#141414] z-0" />
        
        {/* Spotlight radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay pointer-events-none z-1" />
        
        {/* Gloss sheen */}
        <div 
          ref={glossRef}
          className="absolute inset-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-2"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.02) 50%, transparent 54%)'
          }}
        />

        <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
