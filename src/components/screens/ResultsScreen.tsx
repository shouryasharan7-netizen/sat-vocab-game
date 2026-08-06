import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import { ArrowRight, Trophy } from 'lucide-react';

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
    // Only check achievements once when component mounts
    const newUnlocks = store.checkAchievements();
    setNewAchievements(newUnlocks);
  }, []);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  
  let label = "📚 Keep studying! You'll get there.";
  if (pct >= 90) label = "🌟 Outstanding! You're a vocab master!";
  else if (pct >= 70) label = "👏 Great job! Keep practicing!";
  else if (pct >= 50) label = "💪 Good effort! Review your weak words.";

  if (mode === 'speed') {
    if (score >= 15) label = "⚡ Lightning fast! Incredible!";
    else if (score >= 10) label = "🔥 Speed demon! Well done!";
    else label = "💨 Good speed! Keep pushing!";
  }

  const xpEarned = score * (mode === 'speed' ? 5 : 10);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
      className="max-w-2xl mx-auto w-full px-4 py-12 relative z-10"
    >
      <Card className="text-center p-10 relative overflow-hidden mb-6 border-indigo-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-6xl md:text-7xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] mb-4"
        >
          {mode === 'speed' ? `${score} pts` : `${score}/${total}`}
        </motion.div>
        
        <div className="text-lg text-white font-medium mb-10">{label}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0f0f1a]/80 border border-white/5 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{score}</div>
            <div className="text-xs uppercase tracking-widest text-[#8888a0] font-bold">Correct</div>
          </div>
          <div className="bg-[#0f0f1a]/80 border border-white/5 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{total - score}</div>
            <div className="text-xs uppercase tracking-widest text-[#8888a0] font-bold">Wrong</div>
          </div>
          <div className="bg-[#0f0f1a]/80 border border-white/5 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">+{xpEarned}</div>
            <div className="text-xs uppercase tracking-widest text-[#8888a0] font-bold">XP Earned</div>
          </div>
        </div>

        {newAchievements.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-left"
          >
            <div className="flex items-center gap-2 text-yellow-400 font-bold mb-3">
              <Trophy className="w-5 h-5" /> New Achievements Unlocked!
            </div>
            <div className="grid grid-cols-1 gap-2">
              {newAchievements.map(id => {
                const ach = ACHIEVEMENTS.find(a => a.id === id);
                if (!ach) return null;
                return (
                  <div key={id} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{ach.name}</div>
                      <div className="text-xs text-yellow-200/70">{ach.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <Button variant="primary" size="lg" className="w-full gap-2" onClick={onContinue}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
      
      {wrongWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-sm text-[#8888a0] uppercase tracking-wider mb-4 px-2">Words to review</h3>
          <div className="flex flex-col gap-2">
            {[...new Set(wrongWords)].map(w => {
              const wordObj = store.wordMastery[w];
              return (
                <Card key={w} className="p-4 flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-lg">{w}</span>
                  {wordObj && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-md font-bold",
                      (wordObj.correct / wordObj.seen) < 0.4 ? "bg-red-500/15 text-red-400" :
                      (wordObj.correct / wordObj.seen) < 0.7 ? "bg-orange-500/15 text-orange-400" :
                      "bg-green-500/15 text-green-400"
                    )}>
                      {wordObj.correct}/{wordObj.seen}
                    </span>
                  )}
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
