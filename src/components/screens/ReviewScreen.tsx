import { useGameStore } from '../../store/useGameStore';
import { WORDS } from '../../data/words';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ArrowLeft, BrainCircuit, Info, Clock, AlertCircle } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto w-full px-4 py-8 relative z-10 min-h-screen screen-fade">
      <div className="flex justify-between items-center mb-10">
        <Button variant="secondary" size="sm" onClick={onBack} className="gap-2 glass-pill text-zinc-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <div className="flex items-center gap-2 font-bold text-sm bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl border border-rose-500/20 shadow-inner">
          <BrainCircuit className="w-5 h-5" /> Smart Review
        </div>
      </div>

      {weakWords.length === 0 ? (
        <Card className="text-center p-12 py-20 flex flex-col items-center glass-card">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
          <p className="text-zinc-300 max-w-sm font-medium">No words are due for review right now. Keep playing other modes to discover new words.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {weakWords.map(([w, m]) => {
            const wordObj = WORDS.find(x => x.word === w);
            const ratio = m.correct / m.seen;
            const masteryProgress = Math.min(100, (m.correct / 5) * 100);
            
            const lastRev = m.lastReviewed || 0;
            const intervalDays = m.interval || 0;
            const dueTime = lastRev + (intervalDays * DAY_IN_MS);
            
            let srsStatus = 'upcoming'; // default
            if (now > dueTime + (DAY_IN_MS * 2)) srsStatus = 'overdue';
            else if (now > dueTime) srsStatus = 'due';

            return (
              <div 
                key={w} 
                className="transition-all hover:scale-[1.01] cursor-pointer"
                onClick={() => store.setSelectedWordForDetail(w)}
              >
                <Card className={cn(
                  "p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm glass-card relative overflow-hidden",
                  srsStatus === 'overdue' && "border-rose-500/30 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
                  srsStatus === 'due' && "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
                  srsStatus === 'upcoming' && "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40"
                )}>
                  
                  {/* Subtle pulsing background for overdue items */}
                  {srsStatus === 'overdue' && (
                    <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
                  )}

                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-bold text-white font-serif text-2xl">{w}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          store.setSelectedWordForDetail(w);
                        }}
                        className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="View Details"
                        aria-label="View word details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      
                      {srsStatus === 'overdue' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 px-2 py-1 rounded-md border border-rose-500/20 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {srsStatus === 'due' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due Today
                        </span>
                      )}
                      
                      {ratio < 0.6 && srsStatus === 'upcoming' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-200 px-2 py-1 rounded-md border border-zinc-700">
                          Weak
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-300 leading-relaxed font-medium">{wordObj?.def}</div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 relative z-10">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Mastery</span>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="transparent" />
                            <circle 
                              cx="20" cy="20" r="18" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              fill="transparent" 
                              strokeDasharray="113"
                              strokeDashoffset={113 - (113 * masteryProgress) / 100}
                              className={cn(
                                "transition-all duration-700",
                                masteryProgress >= 100 ? "text-emerald-500" : "text-violet-500"
                              )}
                            />
                          </svg>
                          <span className="text-[11px] font-bold text-white z-10">{m.correct}</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-400">/ 5</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
