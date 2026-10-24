import React, { useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Word } from '../../data/words';

interface FlashcardModeProps {
  q: Word;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  handleWrong: (word: string, actualWord?: Word, noDelay?: boolean) => void;
  handleCorrect: (word: string, e?: React.MouseEvent, noDelay?: boolean) => void;
}

export default function FlashcardMode({ q, isFlipped, setIsFlipped, handleWrong, handleCorrect }: FlashcardModeProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        handleWrong(q.word, q, true);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        handleCorrect(q.word, undefined, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, setIsFlipped, handleWrong, handleCorrect, q]);

  return (
    <div className="perspective-1000 mb-8 w-full max-w-xl mx-auto">
      <div 
        className={cn(
          "relative w-full h-[400px] cursor-pointer transform-style-3d transition-transform duration-500 ease-out select-none",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard: ${q.word}. Click to flip.`}
      >
        <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 glass-card border border-white/10 hover:border-violet-500/30 transition-colors shadow-2xl">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">{q.pos}</div>
          <div className="text-5xl md:text-6xl font-serif italic text-white mb-6 tracking-tight">{q.word}</div>
          <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            Click or press Space to reveal
          </div>
        </Card>
        <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center bg-[#131224] border border-indigo-500/30 shadow-2xl">
          <div className="text-3xl font-serif italic text-white mb-4">{q.word}</div>
          <div className="text-xl text-zinc-200 mb-6 leading-relaxed font-medium max-w-md">{q.def}</div>
          <div className="text-sm text-zinc-400 italic max-w-md border-t border-white/10 pt-4">"{q.ex}"</div>
        </Card>
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <Button 
          variant="danger" 
          size="lg" 
          className="w-48 bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 flex items-center justify-center gap-2" 
          onClick={() => handleWrong(q.word, q, true)}
        >
          <span className="hidden sm:inline-block font-mono text-xs opacity-60">[←]</span> Need Review
        </Button>
        <Button 
          variant="success" 
          size="lg" 
          className="w-48 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center justify-center gap-2" 
          onClick={(e) => handleCorrect(q.word, e, true)}
        >
          <span className="hidden sm:inline-block font-mono text-xs opacity-60">[→]</span> Got It
        </Button>
      </div>

      <div className="text-xs text-zinc-500 text-center mt-4">
        Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Space</kbd> flip · <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">←</kbd> Need Review · <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">→</kbd> Got It
      </div>
    </div>
  );
}
