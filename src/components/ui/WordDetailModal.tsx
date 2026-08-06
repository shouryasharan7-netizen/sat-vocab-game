import { useState, useRef } from 'react';
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

  if (!word) return null;

  const mastery = store.wordMastery[word.word];
  const history = mastery?.history || [];

  const handleSpeak = () => {
    const now = Date.now();
    // Rate limit: max 1 per second
    if (now - lastSpokeTime.current < 1000) return;
    lastSpokeTime.current = now;

    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-extrabold text-white font-serif">{word.word}</h2>
                <button 
                  onClick={handleSpeak}
                  className="p-2 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <span className="text-slate-400 uppercase tracking-widest text-xs font-bold bg-white/5 px-2 py-0.5 rounded mt-2 inline-block">
                {word.pos}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-2 -mr-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Definition */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Definition</h3>
            <p className="text-lg text-slate-200 leading-relaxed">{word.def}</p>
            <p className="text-sm text-slate-400 italic mt-2 border-l-2 border-indigo-500/30 pl-3">"{word.ex}"</p>
          </div>

          {/* Etymology */}
          {word.roots && word.roots.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Etymology
              </h3>
              <div className="flex flex-wrap gap-2">
                {word.roots.map((r, i) => (
                  <div key={i} className="flex items-center bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    <span className="font-mono text-amber-400 bg-slate-900 px-3 py-1.5 border-r border-slate-700">
                      {r.root}
                    </span>
                    <span className="text-slate-300 px-3 py-1.5 text-sm">
                      {r.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synonyms / Antonyms Toggle */}
          {(word.synonyms?.length || word.antonyms?.length) ? (
            <div className="bg-slate-800/50 rounded-xl p-1">
              <div className="flex p-1 bg-slate-900 rounded-lg mb-3">
                <button
                  className={cn(
                    "flex-1 py-1.5 text-sm font-bold rounded-md transition-all",
                    showSynonyms ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
                  )}
                  onClick={() => setShowSynonyms(true)}
                >
                  Synonyms
                </button>
                <button
                  className={cn(
                    "flex-1 py-1.5 text-sm font-bold rounded-md transition-all",
                    !showSynonyms ? "bg-rose-500/20 text-rose-300" : "text-slate-500 hover:text-slate-300"
                  )}
                  onClick={() => setShowSynonyms(false)}
                >
                  Antonyms
                </button>
              </div>
              <div className="px-3 pb-3 flex flex-wrap gap-2">
                {showSynonyms ? (
                  word.synonyms?.map((s, i) => (
                    <span key={i} className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-500/20">
                      {s}
                    </span>
                  )) || <span className="text-slate-500 text-sm italic">No synonyms available.</span>
                ) : (
                  word.antonyms?.map((a, i) => (
                    <span key={i} className="bg-rose-500/10 text-rose-300 px-3 py-1 rounded-full text-sm border border-rose-500/20">
                      {a}
                    </span>
                  )) || <span className="text-slate-500 text-sm italic">No antonyms available.</span>
                )}
              </div>
            </div>
          ) : null}

          {/* Personal Stats Sparkline */}
          <div className="border-t border-slate-800 pt-4 mt-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Performance
            </h3>
            {history.length > 0 ? (
              <div className="flex items-center gap-2">
                {history.map((isCorrect, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex-1 h-2 rounded-full transition-all",
                      isCorrect ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-rose-500"
                    )}
                    title={isCorrect ? "Correct" : "Incorrect"}
                  />
                ))}
                {/* Pad with empty dots if less than 5 */}
                {Array.from({ length: 5 - history.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex-1 h-2 rounded-full bg-slate-800" />
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Play games to build your stats for this word!</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
