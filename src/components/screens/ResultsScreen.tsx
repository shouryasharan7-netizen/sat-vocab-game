import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsScreenProps {
  score: number;
  total: number;
  mode: string;
  wrongWords: string[];
  onContinue: () => void;
}

export function ResultsScreen({ score, total, mode, wrongWords, onContinue }: ResultsScreenProps) {
  const store = useGameStore();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  
  useEffect(() => {
    const newUnlocks = store.checkAchievements();
    setNewAchievements(newUnlocks);

    const pct = total > 0 ? (score / total) : 0;
    if (pct >= 0.7 || mode === 'speed') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24']
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  
  let label = "Keep studying! You'll get there.";
  if (pct >= 90) label = "Outstanding! You're a vocab master!";
  else if (pct >= 70) label = "Great job! Keep practicing!";
  else if (pct >= 50) label = "Good effort! Review your weak words.";

  if (mode === 'speed') {
    if (score >= 15) label = "Lightning fast! Incredible!";
    else if (score >= 10) label = "Speed demon! Well done!";
    else label = "Good speed! Keep pushing!";
  }

  const xpEarned = score * (mode === 'speed' ? 5 : 10);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
      className="max-w-2xl mx-auto w-full px-4 py-12 relative z-10 min-h-[80vh] flex flex-col justify-center"
    >
      <Card className="text-center p-10 relative overflow-hidden mb-8 glass-card border-indigo-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-6 font-serif italic"
        >
          {mode === 'speed' ? `${score} pts` : `${score}/${total}`}
        </motion.div>
        
        <div className="text-xl md:text-2xl text-white font-serif mb-12">{label}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2 font-mono tabular-nums">{score}</div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Correct</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-rose-400 mb-2 font-mono tabular-nums">{total - score}</div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Wrong</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-violet-500/5 animate-pulse" />
            <div className="text-3xl font-bold text-amber-400 mb-2 font-mono tabular-nums relative z-10">+{xpEarned}</div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold relative z-10">XP Earned</div>
          </div>
        </div>

        <AnimatePresence>
          {newAchievements.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left"
            >
              <div className="flex items-center gap-3 text-amber-400 font-bold mb-4 uppercase tracking-widest text-sm">
                <Trophy className="w-5 h-5" /> New Achievements
              </div>
              <div className="grid grid-cols-1 gap-3">
                {newAchievements.map(id => {
                  const ach = ACHIEVEMENTS.find(a => a.id === id);
                  if (!ach) return null;
                  return (
                    <div key={id} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-amber-500/20">
                      <span className="text-3xl filter drop-shadow-md">{ach.icon}</span>
                      <div>
                        <div className="text-base font-bold text-white mb-1">{ach.name}</div>
                        <div className="text-sm text-amber-200/70">{ach.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {wrongWords.length > 0 && (
          <div className="text-left mt-8 pt-8 border-t border-white/10">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Needs Review</h3>
            <div className="flex flex-wrap gap-2">
              {wrongWords.map((w, i) => (
                <span key={i} className="bg-rose-500/10 text-rose-300 px-4 py-2 rounded-lg text-sm font-medium border border-rose-500/20">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Button onClick={onContinue} className="w-full text-lg h-16 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.2)]">
        Continue <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
}
