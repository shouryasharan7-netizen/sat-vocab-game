import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function Background() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0f0f1a]">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f0f1a] to-[#0f0f1a]"></div>
      
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-indigo-500 rounded-full blur-[1px]"
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{
            y: [-20, -1000],
            x: [0, 50],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            left: p.left,
            top: p.top,
          }}
        />
      ))}
    </div>
  );
}
