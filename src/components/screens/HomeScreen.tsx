import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  Zap, 
  ScrollText, 
  CheckCircle, 
  Brain, 
  RefreshCw, 
  Smartphone, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles 
} from 'lucide-react';
import { ParticleNetwork } from '../ui/ParticleNetwork';
import { toggleMute, getIsMuted } from '../../lib/sound';

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
  const [isAudioMuted, setIsAudioMuted] = useState(() => getIsMuted());
  
  const today = new Date().toISOString().split('T')[0];
  const isDailyDone = lastDailyDate === today && dailyProgress >= 10;
  const displayDailyProgress = lastDailyDate === today ? dailyProgress : 0;

  const neededXP = level * 100;
  const prevXP = (level - 1) * 100;
  const progress = Math.max(0, Math.min(100, ((xp - prevXP) / (neededXP - prevXP)) * 100));

  const handleToggleSound = () => {
    const muted = toggleMute();
    setIsAudioMuted(muted);
  };

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
        "w-full h-12 border-b flex items-center justify-center px-4 transition-colors z-20 relative backdrop-blur-sm",
        isDailyDone ? "border-emerald-500/20 bg-emerald-950/20" : "border-violet-500/10 bg-violet-950/10"
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
          <span className={cn("text-xs md:text-sm font-medium", isDailyDone ? "text-emerald-300" : "text-zinc-300")}>
            {isDailyDone ? "Daily target completed! Come back tomorrow for streak bonus" : `Daily goal: ${displayDailyProgress}/10 words`}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-12 md:py-16 relative z-10 screen-fade flex-1 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Digital SAT Edition · 1,000+ Words</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2">SAT Vocab Quest</h1>
              <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
                Built by a student tired of paying $35/yr for Quizlet. Real context sentences from College Board reading passages, procedural sound, and pure Leitner spaced repetition.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 items-center w-full md:w-auto justify-start md:justify-end">
              {/* Sound Toggle Button */}
              <button 
                onClick={handleToggleSound} 
                className="glass-pill px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isAudioMuted ? "Audio muted (click to unmute)" : "Audio enabled (click to mute)"}
                aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
              >
                {isAudioMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                    <span className="hidden sm:inline text-zinc-500">Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Audio</span>
                  </>
                )}
              </button>

              <Button variant="secondary" className="glass-pill gap-1.5 text-xs py-2 px-3" onClick={() => setShowSyncModal(true)} aria-label="Link devices">
                <Smartphone className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span className="hidden sm:inline">Sync</span>
              </Button>

              <Button variant="secondary" className="glass-pill gap-1.5 text-xs py-2 px-3" onClick={onShowLeaderboard} aria-label="View global leaderboard">
                <Trophy className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Rankings</span>
              </Button>

              {/* Level Radial */}
              <div className="relative w-11 h-11 flex items-center justify-center group" title={`Level ${level} (${Math.round(progress)}%)`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="22" cy="22" r="19" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="transparent" />
                  <circle 
                    cx="22" cy="22" r="19" 
                    stroke="url(#levelGradient)" 
                    strokeWidth="3" 
                    fill="transparent" 
                    strokeDasharray="119"
                    strokeDashoffset={119 - (119 * progress) / 100}
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="font-mono font-bold text-sm text-white z-10 group-hover:scale-110 transition-transform">
                  {level}
                </div>
              </div>

              {/* XP Pill */}
              <div className="glass-pill px-3 py-1.5 flex items-center gap-1.5 group hover:border-white/20 transition-all">
                <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">XP</span>
                <span className="font-mono text-white text-sm font-semibold tabular-nums">{xp}</span>
              </div>

              {/* Streak Pill */}
              <div className="glass-pill px-3 py-1.5 flex items-center gap-1.5 group hover:border-white/20 transition-all">
                <Flame className={cn("w-4 h-4 transition-all", streak > 0 ? "text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "text-zinc-600")} />
                <span className={cn("font-mono text-sm font-semibold tabular-nums", streak > 0 ? "text-amber-300" : "text-zinc-400")}>{streak}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" role="toolbar" aria-label="Difficulty filters">
            <span className="text-xs text-zinc-500 font-semibold mr-1 uppercase tracking-wider hidden sm:inline">Deck:</span>
            {(['All', 'Common', 'Advanced', 'Obscure'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  filter === f 
                    ? "bg-white text-black shadow-sm" 
                    : "glass-pill text-zinc-400 hover:text-white hover:border-white/20"
                )}
              >
                {f === 'All' ? 'All Tiers' : f}
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
              className="md:col-span-8 glass-card p-6 min-h-[200px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-emerald-500/40 hover:bg-[#161616] hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-bold">
                  4 Choices · Keyb 1-4
                </span>
              </div>
              <div className="mt-4">
                <h2 className="font-bold text-2xl text-white mb-1.5 group-hover:text-emerald-300 transition-colors">Definition Match</h2>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">Rapid-fire multiple choice. Filter out deceptive distractors and subtle near-synonyms.</p>
              </div>
            </div>

            {/* Context Clues */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => onStartGame('context', filter)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('context', filter)}
              className="md:col-span-4 glass-card p-6 min-h-[200px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-sky-500/40 hover:bg-[#161616] hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <ScrollText className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400/80 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20 font-bold">
                  Passage Fill-In
                </span>
              </div>
              <div className="mt-4">
                <h2 className="font-bold text-xl text-white mb-1.5 group-hover:text-sky-300 transition-colors">Context Clues</h2>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">Fill in the blank using real SAT-style science and literature excerpts.</p>
              </div>
            </div>

            {/* Speed Run */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => onStartGame('speed', filter)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('speed', filter)}
              className="md:col-span-4 glass-card p-6 min-h-[200px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-amber-500/40 hover:bg-[#161616] hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-bold">
                  60s Sprint
                </span>
              </div>
              <div className="mt-4">
                <h2 className="font-bold text-xl text-white mb-1.5 group-hover:text-amber-300 transition-colors">Speed Run</h2>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">60 seconds on the clock. Trust your instincts and build instinctive recall.</p>
              </div>
            </div>

            {/* Word Scramble */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => onStartGame('scramble', filter)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('scramble', filter)}
              className="md:col-span-4 glass-card p-6 min-h-[200px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-violet-500/40 hover:bg-[#161616] hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400/80 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20 font-bold">
                  Roots & Spelling
                </span>
              </div>
              <div className="mt-4">
                <h2 className="font-bold text-xl text-white mb-1.5 group-hover:text-violet-300 transition-colors">Word Scramble</h2>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">Unscramble letters against the clock. Locks down prefixes and roots.</p>
              </div>
            </div>

            {/* Flashcards */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => onStartGame('flashcard', filter)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('flashcard', filter)}
              className="md:col-span-4 glass-card p-6 min-h-[200px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-rose-500/40 hover:bg-[#161616] hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400/80 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 font-bold">
                  Leitner 3D Flip
                </span>
              </div>
              <div className="mt-4">
                <h2 className="font-bold text-xl text-white mb-1.5 group-hover:text-rose-300 transition-colors">Flashcards</h2>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">Self-paced card flip with spaced repetition. Tap Space to flip, arrows to rate.</p>
              </div>
            </div>

            {/* Community Hardest */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => onStartGame('community', filter)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStartGame('community', filter)}
              className="md:col-span-12 glass-card p-6 min-h-[140px] cursor-pointer border border-white/10 hover:border-red-500/40 hover:bg-[#161616] hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex gap-4 md:gap-5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex shrink-0 items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 stroke-[1.75]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-xl text-white group-hover:text-red-300 transition-colors">Community Hardest</h2>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-bold">
                        Top 50 Fails
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">The 50 words players get wrong most frequently. See if you can beat the crowd.</p>
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
              className="md:col-span-12 glass-card p-6 min-h-[140px] cursor-pointer border border-white/10 hover:border-fuchsia-500/40 hover:bg-[#161616] hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex gap-4 md:gap-5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex shrink-0 items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 stroke-[1.75]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-xl text-white group-hover:text-fuchsia-300 transition-colors">Review Weak Words</h2>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-400/80 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20 font-bold">
                        Leitner SRS Deck
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">Your personal hit list. Spaced repetition brings words back right before you forget them.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Human, honest footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            Built with ☕ for <span className="text-zinc-300 font-medium">Hack Club Stardance</span>
          </div>
          <div className="flex items-center gap-3">
            <span>100% Free Forever</span>
            <span>·</span>
            <span>Zero Trackers</span>
            <span>·</span>
            <span>Works Offline (PWA)</span>
          </div>
        </footer>
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
