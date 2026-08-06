import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { WORDS } from '../../data/words';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';

export function ReviewScreen({ onBack }: { onBack: () => void }) {
  const store = useGameStore();

  const weakWords = Object.entries(store.wordMastery)
    .filter(([_, m]) => m.seen > 0 && m.correct / m.seen < 0.7)
    .sort((a, b) => (a[1].correct / a[1].seen) - (b[1].correct / b[1].seen))
    .slice(0, 20);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto w-full px-4 py-8 relative z-10"
    >
      <div className="flex justify-between items-center mb-8">
        <Button variant="secondary" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <div className="font-bold text-white text-lg bg-white/5 px-4 py-2 rounded-xl border border-white/5">
          📚 Weak Words
        </div>
      </div>

      {weakWords.length === 0 ? (
        <Card className="text-center p-12 py-20 flex flex-col items-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">No weak words!</h2>
          <p className="text-[#8888a0]">You're crushing it. Keep playing to maintain mastery.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {weakWords.map(([w, m]) => {
            const wordObj = WORDS.find(x => x.word === w);
            const ratio = m.correct / m.seen;
            return (
              <Card key={w} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-bold text-amber-400 text-xl mb-1">{w}</div>
                  <div className="text-sm text-[#8888a0] leading-relaxed">{wordObj?.def}</div>
                </div>
                <div className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-bold self-start md:self-auto shrink-0",
                  ratio < 0.4 ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                  ratio < 0.7 ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" :
                  "bg-green-500/15 text-green-400 border border-green-500/20"
                )}>
                  {m.correct}/{m.seen} Mastered
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
