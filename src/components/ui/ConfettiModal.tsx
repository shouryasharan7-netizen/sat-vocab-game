import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { Award, X } from 'lucide-react';

export function ConfettiModal() {
  const store = useGameStore();
  const word = store.showConfettiFor;

  useEffect(() => {
    if (word) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, { particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

      // Auto close after 4 seconds
      const timeout = setTimeout(() => {
        store.clearConfetti();
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [word]);

  return (
    <AnimatePresence>
      {word && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl shadow-emerald-500/20"
          >
            <button 
              onClick={() => store.clearConfetti()}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Award className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-2 font-serif">
              Mastered!
            </h2>
            <p className="text-emerald-400 font-bold text-xl mb-4">
              "{word}"
            </p>
            <p className="text-slate-400 text-sm">
              You've answered this word correctly 5 times. It has been added to your long-term spaced repetition schedule.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
