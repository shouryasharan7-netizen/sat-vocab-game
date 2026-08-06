import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { cn } from '../ui/Button';
import { Flame, Star, Trophy, BookOpen, Zap, Target, ScrollText, CheckCircle, ChevronRight, Moon, Award, Flag, Clock, SplitSquareHorizontal } from 'lucide-react';

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
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

interface HomeScreenProps {
  onStartGame: (mode: string) => void;
  onShowReview: () => void;
}

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  first_correct: <Target className="w-6 h-6" />,
  streak_5: <Flame className="w-6 h-6" />,
  streak_10: <Zap className="w-6 h-6" />,
  master_10: <BookOpen className="w-6 h-6" />,
  master_50: <Award className="w-6 h-6" />,
  level_5: <Star className="w-6 h-6" />,
  level_10: <Trophy className="w-6 h-6" />,
  speed_demon: <Clock className="w-6 h-6" />,
  perfect_quiz: <CheckCircle className="w-6 h-6" />,
  night_owl: <Moon className="w-6 h-6" />
};

export function HomeScreen({ onStartGame, onShowReview }: HomeScreenProps) {
  const { level, xp, streak, lostStreak, achievements, recoverStreak } = useGameStore();
  const [filter, setFilter] = useState<'All' | 'Common' | 'Advanced' | 'Obscure'>('All');

  const neededXP = level * 100;
  const prevXP = (level - 1) * 100;
  const progress = Math.max(0, Math.min(100, ((xp - prevXP) / (neededXP - prevXP)) * 100));

  return (
    <motion.div 
      className="max-w-5xl mx-auto w-full px-4 py-8 relative z-10"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
    >
      {/* Daily Quest Banner */}
      <motion.div variants={item} className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-indigo-500/5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-xl">
              <Flag className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Daily Quest</h2>
              <p className="text-sm text-slate-400">Complete 10 words today</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div className="h-full bg-emerald-500 w-[30%]" />
            </div>
            <span className="text-sm font-bold text-emerald-400">3/10</span>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all shadow-md active:scale-95">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Header & Stats */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-6 mb-12 items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white">
            SAT Vocab Quest
          </h1>
          <p className="text-slate-400 text-lg">Master 200+ Digital SAT words through play</p>
        </div>

        <div className="flex gap-4 items-center bg-slate-900/50 p-3 rounded-3xl border border-slate-800/50 backdrop-blur-md">
          {/* Level Badge */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
              <motion.circle 
                cx="32" cy="32" r="28" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray="176"
                strokeDashoffset={176 - (176 * progress) / 100}
                className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                initial={{ strokeDashoffset: 176 }}
                animate={{ strokeDashoffset: 176 - (176 * progress) / 100 }}
                transition={{ duration: 1.5, type: "spring", bounce: 0.1 }}
              />
            </svg>
            <div className="bg-slate-900 rounded-full w-12 h-12 flex items-center justify-center z-10 font-black text-xl text-white shadow-inner">
              {level}
            </div>
          </div>
          
          {/* XP & Streak */}
          <div className="flex flex-col gap-2 pr-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-slate-200">{xp} <span className="text-slate-500 text-xs">XP</span></span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="relative">
                  <Flame className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-rose-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-bold text-sm text-slate-200">{streak} <span className="text-slate-500 text-xs">Day Streak</span></span>
              </div>
              
              <AnimatePresence>
                {lostStreak > 0 && xp >= 100 && (
                  <motion.button 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={recoverStreak}
                    className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md font-bold hover:bg-amber-500/30 transition-colors border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] mt-1 whitespace-nowrap flex items-center gap-1"
                  >
                    Recover {lostStreak} Streak <span className="text-amber-500/70 ml-1">(-100 XP)</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Toggle */}
      <motion.div variants={item} className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Common', 'Advanced', 'Obscure'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f as any)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap active:scale-95",
              filter === f 
                ? "bg-slate-200 text-slate-900 shadow-md" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            )}
          >
            {f === 'All' ? 'Study: All' : f}
          </button>
        ))}
      </motion.div>

      {/* Game Modes Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12">
        {/* Primary Modes */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-8 group cursor-pointer"
          onClick={() => onStartGame('quiz')}
        >
          <div className="h-full bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-6 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/10 group-hover:border-indigo-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex flex-col h-full justify-between">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-white mb-2">Definition Match</h3>
                <p className="text-sm text-slate-400">Master precise meanings through rapid-fire multiple choice. The foundational SAT skill.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-4 group cursor-pointer"
          onClick={() => onStartGame('context')}
        >
          <div className="h-full bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-6 transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/10 group-hover:border-emerald-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 shadow-inner">
              <ScrollText className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-xl text-white mb-2">Context Clues</h3>
            <p className="text-sm text-slate-400">Fill in the blanks using sentence context.</p>
          </div>
        </motion.div>

        {/* Secondary Modes */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-6 group cursor-pointer"
          onClick={() => onStartGame('speed')}
        >
          <div className="h-full bg-gradient-to-br from-amber-500/5 to-transparent border border-slate-800 rounded-3xl p-5 transition-all group-hover:border-amber-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Speed Run</h3>
                <p className="text-xs text-slate-400">60s time attack</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-6 group cursor-pointer"
          onClick={() => onStartGame('flashcard')}
        >
          <div className="h-full bg-gradient-to-br from-pink-500/5 to-transparent border border-slate-800 rounded-3xl p-5 transition-all group-hover:border-pink-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Flashcards</h3>
                <p className="text-xs text-slate-400">Active recall</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contrast Match */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-6 group cursor-pointer"
          onClick={() => onStartGame('contrast')}
        >
          <div className="h-full bg-gradient-to-br from-cyan-500/5 to-transparent border border-slate-800 rounded-3xl p-5 transition-all group-hover:border-cyan-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <SplitSquareHorizontal className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Contrast Match</h3>
                <p className="text-xs text-slate-400">Synonym or Antonym?</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Review Mode */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-6 group cursor-pointer"
          onClick={onShowReview}
        >
          <div className="h-full bg-gradient-to-br from-rose-500/5 to-transparent border border-slate-800 rounded-3xl p-5 transition-all group-hover:border-rose-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Weak Words</h3>
                <p className="text-xs text-slate-400">Focus on mistakes</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div variants={item}>
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = achievements.includes(ach.id);
            return (
              <motion.div 
                whileHover={unlocked ? { scale: 1.05 } : {}}
                key={ach.id} 
                className={cn(
                  "p-5 rounded-2xl text-center flex flex-col items-center justify-center border transition-all",
                  unlocked 
                    ? `border-slate-700 bg-slate-800/50 shadow-lg` 
                    : "border-slate-800 bg-slate-900/50 opacity-60 grayscale"
                )}
              >
                <div className={cn(
                  "mb-3 p-3 rounded-full shadow-inner", 
                  unlocked ? (ach as any).bg : "bg-slate-800",
                  unlocked ? (ach as any).color : "text-slate-500"
                )}>
                  {ACHIEVEMENT_ICONS[ach.id] || <Trophy className="w-6 h-6" />}
                </div>
                <div className="font-bold text-sm text-white mb-1 leading-tight">{ach.name}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{ach.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Weekly Leaderboard */}
      <motion.div variants={item} className="mt-12 mb-8">
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          <Flag className="w-4 h-4" /> Weekly Leaderboard
        </h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-3">
            {[
              { rank: 1, name: "Sarah J.", xp: Math.max(xp + 450, 2450), streak: 12, isUser: false },
              { rank: 2, name: "Alex K.", xp: Math.max(xp + 120, 1120), streak: 8, isUser: false },
              { rank: 3, name: "You", xp: xp, streak: streak, isUser: true },
              { rank: 4, name: "Mike R.", xp: xp > 50 ? xp - 50 : 50, streak: 3, isUser: false },
            ].sort((a, b) => b.xp - a.xp).map((user, i) => (
              <div key={user.name} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all", user.isUser ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-slate-800/30 border-transparent hover:bg-slate-800/50")}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", i === 0 ? "bg-amber-500 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : i === 1 ? "bg-slate-300 text-slate-900 shadow-[0_0_10px_rgba(203,213,225,0.5)]" : i === 2 ? "bg-orange-400 text-orange-950 shadow-[0_0_10px_rgba(251,146,60,0.5)]" : "bg-slate-800 text-slate-400")}>
                    {i + 1}
                  </div>
                  <div className="font-bold text-slate-200">{user.name}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Flame className={cn("w-4 h-4", user.streak > 0 ? "text-rose-500" : "text-slate-600")} />
                    <span className="font-bold text-sm text-slate-300">{user.streak}</span>
                  </div>
                  <div className="flex items-center gap-1.5 w-16 justify-end">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-slate-300">{user.xp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
