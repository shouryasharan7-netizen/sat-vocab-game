import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Card } from '../ui/Card';
import { cn } from '../ui/Button';
import { Flame, Star, Trophy, BookOpen, Zap, Target, ScrollText, CheckCircle } from 'lucide-react';

import { type Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface HomeScreenProps {
  onStartGame: (mode: string) => void;
  onShowReview: () => void;
}

export function HomeScreen({ onStartGame, onShowReview }: HomeScreenProps) {
  const { level, xp, streak, wordMastery, achievements } = useGameStore();

  const mastered = Object.values(wordMastery).filter(m => m.correct >= 3).length;
  const neededXP = level * 100;
  const prevXP = (level - 1) * 100;
  const progress = ((xp - prevXP) / (neededXP - prevXP)) * 100;

  return (
    <motion.div 
      className="max-w-4xl mx-auto w-full px-4 py-12 relative z-10"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
    >
      <motion.div variants={item} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            SAT Vocab Quest
          </span>
        </h1>
        <p className="text-[#8888a0] text-lg">Master 200+ Digital SAT words through play</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="flex flex-col items-center justify-center py-6">
          <Target className="w-6 h-6 text-indigo-400 mb-2" />
          <div className="text-3xl font-black text-white">{level}</div>
          <div className="text-xs text-[#8888a0] uppercase tracking-wider font-semibold mt-1">Level</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <Star className="w-6 h-6 text-amber-400 mb-2" />
          <div className="text-3xl font-black text-white">{xp}</div>
          <div className="text-xs text-[#8888a0] uppercase tracking-wider font-semibold mt-1">XP</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <Flame className="w-6 h-6 text-orange-500 mb-2" />
          <div className="text-3xl font-black text-white">{streak}</div>
          <div className="text-xs text-[#8888a0] uppercase tracking-wider font-semibold mt-1">Streak</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
          <div className="text-3xl font-black text-white">{mastered}</div>
          <div className="text-xs text-[#8888a0] uppercase tracking-wider font-semibold mt-1">Mastered</div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm">Progress to Level {level + 1}</span>
            <span className="text-xs text-[#8888a0]">{xp - prevXP} / {neededXP - prevXP} XP</span>
          </div>
          <div className="h-3 bg-[#0f0f1a] rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Card hoverable onClick={() => onStartGame('quiz')} className="flex items-center gap-6 p-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Definition Match</h3>
            <p className="text-sm text-[#8888a0]">Pick the correct meaning</p>
          </div>
        </Card>
        
        <Card hoverable onClick={() => onStartGame('context')} className="flex items-center gap-6 p-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <ScrollText className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Context Clues</h3>
            <p className="text-sm text-[#8888a0]">Fill in the blank</p>
          </div>
        </Card>

        <Card hoverable onClick={() => onStartGame('scramble')} className="flex items-center gap-6 p-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-blue-400 tracking-widest">A-Z</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Word Scramble</h3>
            <p className="text-sm text-[#8888a0]">Unscramble the letters</p>
          </div>
        </Card>

        <Card hoverable onClick={() => onStartGame('flashcard')} className="flex items-center gap-6 p-6">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7 text-pink-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Flashcards</h3>
            <p className="text-sm text-[#8888a0]">Active recall practice</p>
          </div>
        </Card>

        <Card hoverable onClick={() => onStartGame('speed')} className="flex items-center gap-6 p-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Speed Run</h3>
            <p className="text-sm text-[#8888a0]">60 seconds, max score</p>
          </div>
        </Card>

        <Card hoverable onClick={onShowReview} className="flex items-center gap-6 p-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Review Weak Words</h3>
            <p className="text-sm text-[#8888a0]">Focus on mistakes</p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <h3 className="font-bold text-sm text-[#8888a0] uppercase tracking-wider mb-4 px-2">🏆 Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = achievements.includes(ach.id);
            return (
              <Card 
                key={ach.id} 
                className={cn(
                  "p-4 text-center transition-all flex flex-col items-center justify-center",
                  unlocked ? "border-yellow-500/50 bg-yellow-500/5" : "opacity-40 grayscale"
                )}
              >
                <div className="text-2xl mb-2">{ach.icon}</div>
                <div className="font-bold text-xs text-white mb-1 leading-tight">{ach.name}</div>
                <div className="text-[10px] text-[#8888a0] leading-tight">{ach.desc}</div>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
