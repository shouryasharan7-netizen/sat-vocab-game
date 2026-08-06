import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { WORDS } from '../../data/words';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import { ArrowLeft, BrainCircuit, Info } from 'lucide-react';

export function ReviewScreen({ onBack }: { onBack: () => void }) {
  const store = useGameStore();

  const now = Date.now();
  const DAY_IN_MS = 24 * 60 * 60 * 1000;

  const weakWords = Object.entries(store.wordMastery)
    .filter(([_, m]) => {
      if (m.seen === 0) return false;
      const accuracy = m.correct / m.seen;
      const isWeak = accuracy < 0.6;
      
      const lastRev = m.lastReviewed || 0;
      const intervalDays = m.interval || 0;
      const isDue = (now - lastRev) > (intervalDays * DAY_IN_MS);
      
      return isWeak || isDue;
    })
    .sort((a, b) => {
      const accA = a[1].correct / Math.max(1, a[1].seen);
      const accB = b[1].correct / Math.max(1, b[1].seen);
      return accA - accB; // Lowest accuracy first
    })
    .slice(0, 20);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
      className="max-w-3xl mx-auto w-full px-4 py-8 relative z-10"
    >
      <div className="flex justify-between items-center mb-8">
        <Button variant="secondary" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <div className="flex items-center gap-2 font-bold text-white text-sm bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl border border-rose-500/20 shadow-inner">
          <BrainCircuit className="w-5 h-5" /> Smart Review
        </div>
      </div>

      {weakWords.length === 0 ? (
        <Card className="text-center p-12 py-20 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <span className="text-4xl text-emerald-400">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
          <p className="text-slate-400 max-w-sm">No words are due for review right now. Keep playing other modes to discover new words.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {weakWords.map(([w, m]) => {
            const wordObj = WORDS.find(x => x.word === w);
            const ratio = m.correct / m.seen;
            const masteryProgress = Math.min(100, (m.correct / 5) * 100);

            return (
              <motion.div whileHover={{ scale: 1.01 }} key={w}>
                <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-800/50 hover:border-slate-700 transition-all shadow-sm hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-bold text-slate-100 font-serif text-xl">{w}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          store.setSelectedWordForDetail(w);
                        }}
                        className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {ratio < 0.6 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                          Weak
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 leading-relaxed font-serif">{wordObj?.def}</div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Mastery</span>
                      <div className="flex items-center gap-2">
                        {/* Word Mastery Ring */}
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                            <circle 
                              cx="16" cy="16" r="14" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              fill="transparent" 
                              strokeDasharray="88"
                              strokeDashoffset={88 - (88 * masteryProgress) / 100}
                              className={cn(
                                "transition-all duration-1000",
                                masteryProgress >= 100 ? "text-emerald-500" : "text-indigo-500"
                              )}
                            />
                          </svg>
                          <span className="text-[10px] font-bold text-white z-10">{m.correct}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-300">/ 5</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
