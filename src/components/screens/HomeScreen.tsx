import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGameStore } from '../../store/useGameStore';
import { cn } from '../ui/Button';
import { Flame, Trophy, BookOpen, Zap, ScrollText, CheckCircle, Brain, RefreshCw } from 'lucide-react';
import { ParticleNetwork } from '../ui/ParticleNetwork';
import { TiltCard } from '../ui/TiltCard';

gsap.registerPlugin(ScrollTrigger);

interface HomeScreenProps {
  onStartGame: (mode: string, filter?: string) => void;
  onShowReview: () => void;
  onShowLeaderboard: () => void;
}

export function HomeScreen({ onStartGame, onShowReview, onShowLeaderboard }: HomeScreenProps) {
  const { level, xp, streak, dailyProgress, lastDailyDate } = useGameStore();
  const [filter, setFilter] = useState<'All' | 'Common' | 'Advanced' | 'Obscure'>('All');
  
  const today = new Date().toISOString().split('T')[0];
  const isDailyDone = lastDailyDate === today && dailyProgress >= 10;
  const displayDailyProgress = lastDailyDate === today ? dailyProgress : 0;

  const neededXP = level * 100;
  const prevXP = (level - 1) * 100;
  const progress = Math.max(0, Math.min(100, ((xp - prevXP) / (neededXP - prevXP)) * 100));

  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Hero Stats Counter
  const xpRef = useRef<HTMLSpanElement>(null);
  const streakRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    // Number counter animation for HUD
    if (xpRef.current) {
      gsap.fromTo(xpRef.current, { innerHTML: prevXP }, { innerHTML: xp, duration: 2, ease: 'expo.out', snap: { innerHTML: 1 } });
    }
    if (streakRef.current) {
      gsap.fromTo(streakRef.current, { innerHTML: 0 }, { innerHTML: streak, duration: 1.5, ease: 'expo.out', snap: { innerHTML: 1 }, delay: 0.2 });
    }
  }, [xp, prevXP, streak]);

  useEffect(() => {
    // ScrollTrigger stagger for cards
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.stagger-card');
      gsap.fromTo(cards, 
        { y: 40, opacity: 0 },
        {
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.08, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          }
        }
      );
    }
  }, []);

  return (
    <>
      <ParticleNetwork />
      
      {/* Daily Quest Banner */}
      <div className={cn(
        "w-full h-14 border-b flex items-center justify-center px-4 transition-colors z-20 relative",
        isDailyDone ? "border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent" : "border-violet-500/10 bg-gradient-to-b from-violet-500/5 to-transparent"
      )}>
        <div className="flex items-center gap-3">
          {isDailyDone ? (
            <Trophy className="w-4 h-4 text-emerald-400" />
          ) : (
            <div className="w-24 h-1.5 glass-pill overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" 
                style={{ width: `${(displayDailyProgress / 10) * 100}%` }}
              />
            </div>
          )}
          <span className={cn("text-sm font-medium", isDailyDone ? "text-emerald-400" : "text-zinc-300")}>
            {isDailyDone ? "Daily goal crushed" : "Complete 10 words today"}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-24 relative z-10">
        
        {/* HUD Hero */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-24 gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">SAT Vocab Quest</h1>
            <p className="text-zinc-400 text-lg">Master 1000+ Digital SAT words through play.</p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Leaderboard Button */}
            <button onClick={onShowLeaderboard} className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-xl font-bold hover:bg-amber-500/20 transition-all border border-amber-500/20 shadow-inner group mr-2">
              <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Leaderboard</span>
            </button>

            {/* Level Badge */}
            <div className="relative w-12 h-12 flex items-center justify-center group">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="transparent" />
                <motion.circle 
                  cx="24" cy="24" r="22" 
                  stroke="url(#levelGradient)" 
                  strokeWidth="3" 
                  fill="transparent" 
                  strokeDasharray="138"
                  strokeDashoffset={138 - (138 * progress) / 100}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="font-mono font-bold text-lg text-white z-10 group-hover:scale-110 transition-transform">
                {level}
              </div>
            </div>

            {/* XP Pill */}
            <div className="glass-pill px-4 py-2 flex items-center gap-2 group hover:border-white/10 hover:scale-105 transition-all">
              <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest">XP</div>
              <span ref={xpRef} className="font-mono text-white text-base font-medium tabular-nums">{xp}</span>
            </div>

            {/* Streak Pill */}
            <div className="glass-pill px-4 py-2 flex items-center gap-2 group hover:border-white/10 hover:scale-105 transition-all">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span ref={streakRef} className="font-mono text-white text-base font-medium tabular-nums">{streak}</span>
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Common', 'Advanced', 'Obscure'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-all whitespace-nowrap",
                filter === f 
                  ? "bg-white text-black font-semibold" 
                  : "glass-pill text-zinc-400 hover:text-zinc-200"
              )}
            >
              {f === 'All' ? 'Study: All' : f}
            </button>
          ))}
        </div>

        {/* Modes Grid */}
        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div className="stagger-card md:col-span-8 min-h-[220px] h-full">
            <TiltCard accentColor="emerald" onClick={() => onStartGame('quiz', filter)}>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-white mb-2">Definition Match</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">Master precise meanings through rapid-fire multiple choice. The foundational SAT skill.</p>
                </div>
              </div>
            </TiltCard>
          </div>

          <div className="stagger-card md:col-span-4 min-h-[220px] h-full">
            <TiltCard accentColor="sky" onClick={() => onStartGame('context', filter)}>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <ScrollText className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white mb-2">Context Clues</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">Fill in the blanks using sentence context.</p>
                </div>
              </div>
            </TiltCard>
          </div>

          <div className="stagger-card md:col-span-4 min-h-[220px] h-full">
            <TiltCard accentColor="amber" onClick={() => onStartGame('speed', filter)}>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Zap className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white mb-2">Speed Run</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">Beat the clock. Tests quick recall and mastery.</p>
                </div>
              </div>
            </TiltCard>
          </div>

          <div className="stagger-card md:col-span-4 min-h-[220px] h-full">
            <TiltCard accentColor="violet" onClick={() => onStartGame('scramble', filter)}>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <RefreshCw className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white mb-2">Word Scramble</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">Spell words correctly from their definitions.</p>
                </div>
              </div>
            </TiltCard>
          </div>

          <div className="stagger-card md:col-span-4 min-h-[220px] h-full">
            <TiltCard accentColor="rose" onClick={() => onStartGame('flashcard', filter)}>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <BookOpen className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white mb-2">Flashcards</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">Classic study mode with no pressure.</p>
                </div>
              </div>
            </TiltCard>
          </div>

          <div className="stagger-card md:col-span-12 h-[200px]">
            <TiltCard accentColor="red" onClick={onShowReview}>
              <div className="p-6 h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex shrink-0 items-center justify-center text-red-400">
                    <Brain className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-white mb-2">Review Weak Words</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2 max-w-md">Targeted spaced repetition for words you missed. Strengthen your weak points algorithmically.</p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>

        </div>
      </div>
    </>
  );
}
