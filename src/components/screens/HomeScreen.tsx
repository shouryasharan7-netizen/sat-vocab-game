import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Flame, Trophy, BookOpen, Zap, ScrollText, CheckCircle, Brain, RefreshCw, Smartphone, X } from 'lucide-react';
import { ParticleNetwork } from '../ui/ParticleNetwork';

interface HomeScreenProps {
  onStartGame: (mode: string, filter: string) => void;
  onShowLeaderboard: () => void;
  onShowReview: () => void;
}

export function HomeScreen({ onStartGame, onShowLeaderboard, onShowReview }: HomeScreenProps) {
  const store = useGameStore();
  const { level, xp, streak, dailyProgress, lastDailyDate } = store;
  const [filter, setFilter] = useState<'All' | 'Common' | 'Advanced' | 'Obscure'>('All');
  
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [syncError, setSyncError] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const isDailyDone = lastDailyDate === today && dailyProgress >= 10;
  const displayDailyProgress = lastDailyDate === today ? dailyProgress : 0;

  const neededXP = level * 100;
  const prevXP = (level - 1) * 100;
  const progress = Math.max(0, Math.min(100, ((xp - prevXP) / (neededXP - prevXP)) * 100));

  const handleGenerateSync = async () => {
    try {
      setSyncError('');
      let currentUid = store.uid;
      if (!currentUid) {
        currentUid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        store.setUid(currentUid);
      }
      const res = await fetch('/api/sync', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ action: 'generate', uid: currentUid }) 
      });
      const data = await res.json();
      if (data.code) setGeneratedCode(data.code);
      else setSyncError(data.error || 'Failed to generate code');
    } catch {
      setSyncError('Network error (Are you running locally without vercel dev?)');
    }
  };

  const handleConsumeSync = async () => {
    if (syncCode.length !== 6) return;
    try {
      setSyncError('');
      const res = await fetch('/api/sync', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ action: 'consume', code: syncCode }) 
      });
      const data = await res.json();
      
      if (data.targetUid) {
        store.setUid(data.targetUid);
        const success = await store.loadFromCloud(data.targetUid);
        if (success) {
          setShowSyncModal(false);
          setSyncCode('');
          alert('Device successfully linked! Save data loaded.');
        } else {
          setSyncError('Linked, but failed to load save data.');
        }
      } else {
        setSyncError(data.error || 'Invalid code');
      }
    } catch {
      setSyncError('Network error');
    }
  };

  return (
    <>
      <ParticleNetwork />
      
      {/* Daily Banner */}
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
          <span className={cn("text-sm font-medium", isDailyDone ? "text-emerald-400" : "text-zinc-200")}>
            {isDailyDone ? "Daily goal crushed" : "Complete 10 words today"}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-24 relative z-10 screen-fade">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-24 gap-6 md:gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">SAT Vocab Quest</h1>
            <p className="text-zinc-300 text-lg">Master 1000+ Digital SAT words through play.</p>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full justify-center md:justify-end">
            <Button variant="secondary" className="glass-pill gap-2 flex" onClick={() => setShowSyncModal(true)} aria-label="Link your account">
              <Smartphone className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span className="hidden sm:inline">Link</span>
            </Button>
            <Button variant="secondary" className="glass-pill gap-2" onClick={onShowLeaderboard} aria-label="View global leaderboard">
              <Trophy className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>

            {/* Level Radial */}
            <div className="relative w-12 h-12 flex items-center justify-center group" title={`Level ${level} (${Math.round(progress)}%)`}>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="transparent" />
                <circle 
                  cx="24" cy="24" r="22" 
                  stroke="url(#levelGradient)" 
                  strokeWidth="3" 
                  fill="transparent" 
                  strokeDasharray="138"
                  strokeDashoffset={138 - (138 * progress) / 100}
                  className="transition-all duration-700 ease-out"
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
            <div className="glass-pill px-4 py-2 flex items-center gap-2 group hover:border-white/20 hover:scale-105 transition-all">
              <div className="text-zinc-400 text-xs font-medium uppercase tracking-widest">XP</div>
              <span className="font-mono text-white text-base font-medium tabular-nums">{xp}</span>
            </div>

            {/* Streak Pill */}
            <div className="glass-pill px-4 py-2 flex items-center gap-2 group hover:border-white/20 hover:scale-105 transition-all">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="font-mono text-white text-base font-medium tabular-nums">{streak}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="toolbar" aria-label="Difficulty filters">
          {(['All', 'Common', 'Advanced', 'Obscure'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-all whitespace-nowrap cursor-pointer",
                filter === f 
                  ? "bg-white text-black font-semibold shadow-md" 
                  : "glass-pill text-zinc-300 hover:text-white hover:border-white/20"
              )}
            >
              {f === 'All' ? 'Study: All' : f}
            </button>
          ))}
        </div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Definition Match */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => onStartGame('quiz', filter)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('quiz', filter)}
            className="md:col-span-8 glass-card p-6 min-h-[220px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-emerald-500/40 hover:bg-[#181818] hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-2xl text-white mb-2 group-hover:text-emerald-300 transition-colors">Definition Match</h2>
              <p className="text-sm text-zinc-300 line-clamp-2">Master precise meanings through rapid-fire multiple choice.</p>
            </div>
          </div>

          {/* Context Clues */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => onStartGame('context', filter)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('context', filter)}
            className="md:col-span-4 glass-card p-6 min-h-[220px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-sky-500/40 hover:bg-[#181818] hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <ScrollText className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white mb-2 group-hover:text-sky-300 transition-colors">Context Clues</h2>
              <p className="text-sm text-zinc-300 line-clamp-2">Fill in the blanks using sentence context.</p>
            </div>
          </div>

          {/* Speed Run */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => onStartGame('speed', filter)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('speed', filter)}
            className="md:col-span-4 glass-card p-6 min-h-[220px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-amber-500/40 hover:bg-[#181818] hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white mb-2 group-hover:text-amber-300 transition-colors">Speed Run</h2>
              <p className="text-sm text-zinc-300 line-clamp-2">Beat the clock. Tests quick recall and mastery.</p>
            </div>
          </div>

          {/* Word Scramble */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => onStartGame('scramble', filter)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('scramble', filter)}
            className="md:col-span-4 glass-card p-6 min-h-[220px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-violet-500/40 hover:bg-[#181818] hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white mb-2 group-hover:text-violet-300 transition-colors">Word Scramble</h2>
              <p className="text-sm text-zinc-300 line-clamp-2">Unscramble the letters to find the right word.</p>
            </div>
          </div>

          {/* Flashcards */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => onStartGame('flashcard', filter)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('flashcard', filter)}
            className="md:col-span-4 glass-card p-6 min-h-[220px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-rose-500/40 hover:bg-[#181818] hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white mb-2 group-hover:text-rose-300 transition-colors">Flashcards</h2>
              <p className="text-sm text-zinc-300 line-clamp-2">Spaced repetition. Swipe to master the list.</p>
            </div>
          </div>

          {/* Community Hardest */}
          <div 
            role="button"
            tabIndex={0}
            onClick={() => onStartGame('community', filter)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('community', filter)}
            className="md:col-span-12 glass-card p-6 min-h-[160px] cursor-pointer border border-white/10 hover:border-red-500/40 hover:bg-[#181818] hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex shrink-0 items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <Flame className="w-8 h-8 stroke-[1.5]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-bold text-2xl text-white mb-2 group-hover:text-red-300 transition-colors">Community Hardest</h2>
                  <p className="text-sm text-zinc-300 max-w-md">Test yourself against the top 50 most failed words globally.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Weak Words */}
          <div 
            role="button"
            tabIndex={0}
            onClick={onShowReview}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onShowReview()}
            className="md:col-span-12 glass-card p-6 min-h-[180px] cursor-pointer border border-white/10 hover:border-rose-500/40 hover:bg-[#181818] hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex shrink-0 items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 stroke-[1.5]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-bold text-2xl text-white mb-2 group-hover:text-rose-300 transition-colors">Review Weak Words</h2>
                  <p className="text-sm text-zinc-300 line-clamp-2 max-w-md">Targeted spaced repetition for words you missed. Strengthen your weak points algorithmically.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm screen-fade"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sync-modal-title"
        >
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowSyncModal(false)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 id="sync-modal-title" className="text-2xl font-bold text-white mb-2">Link Devices</h2>
            <p className="text-zinc-300 text-sm mb-8">Play seamlessly across your phone and computer without making an account.</p>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-bold text-emerald-400 mb-2">Step 1: Generate Code</h3>
                <p className="text-xs text-zinc-300 mb-4">Click below to generate a sync code on your main device.</p>
                {generatedCode ? (
                  <div className="text-center py-3 bg-black/40 rounded-lg text-3xl font-mono tracking-[0.5em] font-bold text-white">
                    {generatedCode}
                  </div>
                ) : (
                  <Button variant="secondary" className="w-full text-sm" onClick={handleGenerateSync}>Generate Sync Code</Button>
                )}
              </div>

              <div className="text-center text-zinc-400 text-xs font-bold uppercase">OR</div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-bold text-indigo-400 mb-2">Step 2: Enter Code</h3>
                <p className="text-xs text-zinc-300 mb-4">Enter a code from your other device to link this one to it.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="123456"
                    maxLength={6}
                    value={syncCode}
                    onChange={(e) => setSyncCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500 text-white"
                  />
                  <Button variant="primary" onClick={handleConsumeSync} disabled={syncCode.length !== 6}>Link</Button>
                </div>
                {syncError && <p className="text-xs text-rose-400 mt-2">{syncError}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
