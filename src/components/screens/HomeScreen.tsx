import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { cn } from '../ui/Button';
import { Flame, Star, Trophy, BookOpen, Zap, Target, ScrollText, CheckCircle, ChevronRight, Moon, Award, Flag, Clock, SplitSquareHorizontal, Users } from 'lucide-react';
import { LeaderboardModal } from '../ui/LeaderboardModal';
import { TextReveal } from '../ui/TextReveal';
import { MagneticButton } from '../ui/MagneticButton';

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
  onStartGame: (mode: string, filter?: string) => void;
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
  const { level, xp, streak, lostStreak, achievements, recoverStreak, dailyProgress, lastDailyDate } = useGameStore();
  const [filter, setFilter] = useState<'All' | 'Common' | 'Advanced' | 'Obscure'>('All');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isDailyDone = lastDailyDate === today && dailyProgress >= 10;
  const displayDailyProgress = lastDailyDate === today ? dailyProgress : 0;

  const neededXP = level * 100;
  const prevXP = (level - 1) * 100;
  const progress = Math.max(0, Math.min(100, ((xp - prevXP) / (neededXP - prevXP)) * 100));

  return (
    <>
      <motion.div 
      className="max-w-5xl mx-auto w-full px-4 py-8 relative z-10"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
    >
      {/* Daily Quest Banner */}
      <motion.div variants={item} className="mb-12">
        <div className="relative group overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-colors hover:border-indigo-500/30 gap-6">
          {/* Subtle animated background glow */}
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 animate-[shimmer_2s_infinite] transition-opacity" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className={cn("p-3 rounded-2xl shadow-inner", isDailyDone ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-indigo-500/10 border border-indigo-500/20")}>
              {isDailyDone ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <Flag className="w-6 h-6 text-indigo-400" />}
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Daily Quest</h2>
              <p className="text-sm text-slate-400">{isDailyDone ? 'Quest complete! Check back tomorrow.' : 'Complete 10 words today'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-end">
            <div className="flex-1 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden block">
              <motion.div 
                className="h-full bg-emerald-500" 
                initial={{ width: 0 }}
                animate={{ width: `${(displayDailyProgress / 10) * 100}%` }}
                transition={{ duration: 1, type: "spring" }}
              />
            </div>
            <span className="text-sm font-black tracking-widest text-emerald-400 w-10">{displayDailyProgress}/10</span>
            <MagneticButton 
              onClick={() => { if (!isDailyDone) onStartGame('daily', filter); }}
              disabled={isDailyDone}
              className={cn(
                "p-3 rounded-2xl transition-all",
                isDailyDone ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              )}
            >
              {isDailyDone ? <CheckCircle className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </MagneticButton>
          </div>
        </div>
      </motion.div>

      {/* Header & Stats */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-8 mb-16 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-5 mb-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              <TextReveal>SAT Vocab Quest</TextReveal>
            </h1>
            <MagneticButton 
              onClick={() => setIsLeaderboardOpen(true)}
              className="bg-[#111] hover:bg-[#1a1a1a] text-indigo-400 p-3 rounded-2xl border border-[#222] transition-colors flex items-center gap-2 group shadow-xl"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm hidden sm:inline tracking-wide">Leaderboard</span>
            </MagneticButton>
          </div>
          <p className="text-[#888] text-xl font-medium tracking-tight">Master 1000+ Digital SAT words through play.</p>
        </div>

        <div className="flex gap-5 items-center bg-[#0a0a0a] p-4 rounded-[2rem] border border-[#1a1a1a] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
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

      {/* Modes Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-16">
        {/* Definition Match */}
        <motion.div 
          whileHover={{ scale: 0.98, rotate: -1 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-8 group cursor-pointer relative"
          onClick={() => onStartGame('quiz', filter)}
        >
          <div className="h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] p-8 transition-colors group-hover:border-indigo-500/40 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-8 shadow-inner group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
                <CheckCircle className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-black text-3xl text-white mb-3 tracking-tight">Definition Match</h3>
                <p className="text-[#888] font-medium leading-relaxed">Master precise meanings through rapid-fire multiple choice. The foundational SAT skill.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 0.98, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-4 group cursor-pointer relative"
          onClick={() => onStartGame('context', filter)}
        >
          <div className="h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] p-8 transition-colors group-hover:border-emerald-500/40 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-6 shadow-inner group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors relative z-10">
              <ScrollText className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-black text-2xl text-white mb-3 tracking-tight relative z-10">Context Clues</h3>
            <p className="text-[#888] font-medium leading-relaxed relative z-10">Fill in the blanks using sentence context.</p>
          </div>
        </motion.div>

        {/* Speed Run */}
        <motion.div 
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-4 group cursor-pointer relative"
          onClick={() => onStartGame('speed', filter)}
        >
          <div className="h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] p-6 transition-colors group-hover:border-amber-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center shadow-inner group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-colors">
                <Zap className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-xl text-white tracking-tight mb-1">Speed Run</h3>
                <p className="text-sm text-[#888] font-medium">60s time attack</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-6 group cursor-pointer relative"
          onClick={() => onStartGame('flashcard', filter)}
        >
          <div className="h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] p-6 transition-colors group-hover:border-pink-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all duration-700" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center shadow-inner group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-colors">
                <BookOpen className="w-7 h-7 text-pink-400" />
              </div>
              <div>
                <h3 className="font-black text-xl text-white tracking-tight mb-1">Flashcards</h3>
                <p className="text-sm text-[#888] font-medium">Active recall</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contrast Match */}
        <motion.div 
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-6 group cursor-pointer relative"
          onClick={() => onStartGame('contrast', filter)}
        >
          <div className="h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] p-6 transition-colors group-hover:border-cyan-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center shadow-inner group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-colors">
                <SplitSquareHorizontal className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-black text-xl text-white tracking-tight mb-1">Contrast Match</h3>
                <p className="text-sm text-[#888] font-medium">Synonym or Antonym?</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Review Mode */}
        <motion.div 
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-12 lg:col-span-8 group cursor-pointer relative"
          onClick={onShowReview}
        >
          <div className="h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] p-6 transition-colors group-hover:border-rose-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700 opacity-0 group-hover:opacity-100" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center shadow-inner group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-colors">
                <Target className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <h3 className="font-black text-xl text-white tracking-tight mb-1">Smart Review</h3>
                <p className="text-sm text-[#888] font-medium">Focus on the words you struggle with.</p>
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
    </motion.div>
      <LeaderboardModal 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />
    </>
  );
}
