import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function ScrollVelocitySkew({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on mobile or if reduced motion is preferred
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || prefersReducedMotion) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Use GSAP quickTo for highly performant transforms
    const skewTo = gsap.quickTo(container, 'skewY', { duration: 0.1, ease: 'power2.out' });

    // Better way: ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.create({
        trigger: document.body,
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          // self.getVelocity() returns pixels per second
          const skew = Math.max(-1.5, Math.min(1.5, self.getVelocity() * -0.001));
          skewTo(skew);
        }
    });

    return () => {
      skewTo(0);
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} style={{ willChange: 'transform', transformOrigin: 'center center' }}>
      {children}
    </div>
  );
}
