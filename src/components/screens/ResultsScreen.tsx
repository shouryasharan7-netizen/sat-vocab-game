import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowRight, Trophy, Share2, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsScreenProps {
  score: number;
  total: number;
  mode: string;
  wrongWords: string[];
  onContinue: () => void;
  onReviewWeak?: () => void;
}

export function ResultsScreen({ score, total, mode, wrongWords, onContinue, onReviewWeak }: ResultsScreenProps) {
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
  }, [mode, score, total, store]);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  
  let label = "Good practice run! Review your missed words to lock them in.";
  if (pct === 100) label = "Flawless run! The College Board has nothing on you.";
  else if (pct >= 85) label = "Top tier score! Your vocabulary foundation is rock solid.";
  else if (pct >= 70) label = "Great work! A couple tricky distractors caught you, but strong overall.";
  else if (pct >= 50) label = "Solid effort. Spaced repetition will reinforce the ones you missed.";
  else label = "Tough set! Don't sweat it — learning from mistakes is how retention happens.";

  if (mode === 'speed') {
    if (score >= 20) label = "Lightning fast! You crushed the clock with incredible recall.";
    else if (score >= 12) label = "Speed demon! Great instinct and word recognition under pressure.";
    else label = "Good pace! Rapid recognition gets much faster with practice.";
  }

  const xpEarned = score * (mode === 'speed' ? 5 : 10);

  const handleShare = async () => {
    const text = `I just scored ${score}/${total} (${pct}%) in SAT Vocab Quest! 🔥\nCan you beat my score? https://satvocab.xyz`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    } catch {
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12 relative z-10 min-h-[80vh] flex flex-col justify-center screen-fade">
      <Card className="text-center p-10 relative overflow-hidden mb-8 glass-card border-indigo-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-6xl md:text-8xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-6 font-serif italic">
          {mode === 'speed' ? `${score} pts` : `${score}/${total}`}
        </div>
        
        <div className="text-xl md:text-2xl text-white font-serif mb-12">{label}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2 font-mono tabular-nums">{score}</div>
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Correct</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-sky-400 mb-2 font-mono tabular-nums">{pct}%</div>
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Accuracy</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-violet-500/5 animate-pulse" />
            <div className="text-3xl font-bold text-amber-400 mb-2 font-mono tabular-nums relative z-10">+{xpEarned}</div>
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold relative z-10">XP Earned</div>
          </div>
        </div>

        {newAchievements.length > 0 && (
          <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left screen-fade">
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
          </div>
        )}

        {wrongWords.length > 0 && (
          <div className="text-left mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Needs Review ({wrongWords.length})
              </h2>
              {onReviewWeak && (
                <button
                  onClick={onReviewWeak}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <BrainCircuit className="w-3.5 h-3.5" /> Drill These Words
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {wrongWords.map((w, i) => (
                <span key={i} className="bg-rose-500/10 text-rose-300 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-rose-500/20">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button onClick={handleShare} variant="secondary" className="w-full sm:w-1/2 text-base h-14 rounded-xl">
          <Share2 className="w-4 h-4 mr-2" /> Share Score
        </Button>
        <Button onClick={onContinue} className="w-full sm:w-1/2 text-base h-14 rounded-xl shadow-[0_0_24px_rgba(79,70,229,0.25)]">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
