import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, Activity, BookOpen } from 'lucide-react';
import { type Word } from '../../data/words';
import { useGameStore } from '../../store/useGameStore';
import { cn } from './Button';

interface WordDetailModalProps {
  word: Word | null;
  onClose: () => void;
}

export function WordDetailModal({ word, onClose }: WordDetailModalProps) {
  const store = useGameStore();
  const [showSynonyms, setShowSynonyms] = useState(true);
  const lastSpokeTime = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!word) return null;

  const mastery = store.wordMastery[word.word];
  const history = mastery?.history || [];

  const handleSpeak = () => {
    const now = Date.now();
    if (now - lastSpokeTime.current < 1000) return;
    lastSpokeTime.current = now;

    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const modalVariants: any = isMobile ? {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { y: '100%', opacity: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  } : {
    hidden: { scale: 0.95, opacity: 0, filter: 'blur(10px)' },
    visible: { scale: 1, opacity: 1, filter: 'blur(0px)', transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { scale: 0.95, opacity: 0, filter: 'blur(10px)' }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full bg-[#141414] border-t md:border border-white/10 relative overflow-hidden flex flex-col glass-card",
            isMobile ? "rounded-t-3xl max-h-[85vh]" : "rounded-3xl max-w-2xl max-h-[90vh] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
          )}
        >
          {/* Mobile Handle */}
          {isMobile && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />
          )}

          <div className="overflow-y-auto p-6 md:p-10 pt-10 md:pt-10 scrollbar-hide">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between relative z-10 mb-8">
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl md:text-5xl font-black text-white font-serif tracking-tight">{word.word}</h2>
                  <button 
                    onClick={handleSpeak}
                    className="p-3 rounded-full bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all hover:scale-105 active:scale-95"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
                <span className="text-zinc-500 uppercase tracking-widest text-xs font-bold bg-white/5 px-3 py-1 rounded-full mt-4 inline-block">
                  {word.pos}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Definition */}
            <div className="mb-10 relative z-10">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Definition</h3>
              <p className="text-2xl md:text-3xl font-serif text-white leading-snug mb-4">{word.def}</p>
              <p className="text-lg text-zinc-400 italic border-l-2 border-violet-500/30 pl-4 py-1">"{word.ex}"</p>
            </div>

            {/* Mastery progress */}
            <div className="mb-10 flex items-center gap-6">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Mastery Level</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="24" cy="24" r="22" 
                        stroke="#10b981" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray="138"
                        strokeDashoffset={138 - (138 * Math.min(100, ((mastery?.correct || 0) / 5) * 100)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="text-sm font-bold text-white z-10 tabular-nums">{mastery?.correct || 0}/5</span>
                  </div>
                  <div className="text-sm text-zinc-400">
                    Correctly answered <strong className="text-emerald-400">{mastery?.correct || 0}</strong> times.
                  </div>
                </div>
              </div>
            </div>

            {/* Etymology */}
            {word.roots && word.roots.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Etymology
                </h3>
                <div className="flex flex-wrap gap-3">
                  {word.roots.map((r, i) => (
                    <div key={i} className="flex items-center glass-pill overflow-hidden">
                      <span className="font-mono text-amber-400 bg-white/5 px-4 py-2 border-r border-white/5 text-sm font-bold">
                        {r.root}
                      </span>
                      <span className="text-zinc-300 px-4 py-2 text-sm">
                        {r.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synonyms / Antonyms */}
            {(word.synonyms?.length || word.antonyms?.length) ? (
              <div className="bg-[#1a1a1a] rounded-2xl p-2 mb-8">
                <div className="flex p-1 bg-black/40 rounded-xl mb-4">
                  <button
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                      showSynonyms ? "bg-cyan-500/10 text-cyan-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                    onClick={() => setShowSynonyms(true)}
                  >
                    Synonyms
                  </button>
                  <button
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                      !showSynonyms ? "bg-amber-500/10 text-amber-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                    onClick={() => setShowSynonyms(false)}
                  >
                    Antonyms
                  </button>
                </div>
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  {showSynonyms ? (
                    word.synonyms?.map((s, i) => (
                      <span key={i} className="bg-cyan-500/10 text-cyan-300 px-4 py-1.5 rounded-full text-sm font-medium border border-cyan-500/20">
                        {s}
                      </span>
                    )) || <span className="text-zinc-500 text-sm italic">No synonyms available.</span>
                  ) : (
                    word.antonyms?.map((a, i) => (
                      <span key={i} className="bg-amber-500/10 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium border border-amber-500/20">
                        {a}
                      </span>
                    )) || <span className="text-zinc-500 text-sm italic">No antonyms available.</span>
                  )}
                </div>
              </div>
            ) : null}

            {/* Performance Sparkline */}
            {history.length > 0 && (
              <div className="border-t border-white/5 pt-8">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Recent Performance
                </h3>
                <div className="flex items-end gap-1.5 h-8">
                  {history.slice(-20).map((correct, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: correct ? '100%' : '30%', opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "w-3 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity",
                        correct ? "bg-emerald-500" : "bg-rose-500"
                      )}
                      title={correct ? 'Correct' : 'Incorrect'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
