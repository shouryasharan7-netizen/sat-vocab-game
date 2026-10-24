import { useEffect } from 'react';
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
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

      const timeout = setTimeout(() => {
        store.clearConfetti();
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [word, store]);

  if (!word) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm screen-fade"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#141414] border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl shadow-emerald-500/10">
        <button 
          onClick={() => store.clearConfetti()}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
          aria-label="Close"
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
        <p className="text-zinc-300 text-sm">
          You've answered this word correctly 5 times. It has been added to your long-term spaced repetition schedule.
        </p>
      </div>
    </div>
  );
}
