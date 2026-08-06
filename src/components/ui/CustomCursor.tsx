import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on mobile or if reduced motion is preferred
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use GSAP quickTo for 60fps performance
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3.out' });

    const onMouseMove = (e: MouseEvent) => {
      // Center the cursor dot on the mouse
      xTo(e.clientX - 4);
      yTo(e.clientY - 4);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // If hovering a clickable element
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        gsap.to(cursor, { 
          scale: 6, // 8px * 6 = 48px
          opacity: 0.08, 
          duration: 0.2, 
          ease: 'power2.out' 
        });
      }
      // If hovering text
      else if (
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'li'].includes(target.tagName.toLowerCase())
      ) {
        gsap.to(cursor, { 
          scaleX: 0.25, // 2px width
          scaleY: 2.5, // 20px height
          borderRadius: '2px',
          opacity: 1, 
          duration: 0.2, 
          ease: 'power2.out' 
        });
      } else {
        // Reset
        gsap.to(cursor, { 
          scale: 1, 
          scaleX: 1,
          scaleY: 1,
          borderRadius: '50%',
          opacity: 1, 
          duration: 0.2, 
          ease: 'power2.out' 
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{ willChange: 'transform' }}
    />
  );
}
