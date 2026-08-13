import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Word } from '../../data/words';

interface FlashcardModeProps {
  q: Word;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  handleWrong: (word: string, actualWord?: Word, noDelay?: boolean) => void;
  handleCorrect: (word: string, e?: React.MouseEvent, noDelay?: boolean) => void;
}

export default function FlashcardMode({ q, isFlipped, setIsFlipped, handleWrong, handleCorrect }: FlashcardModeProps) {
  return (
    <div className="perspective-1000 mb-8 w-full max-w-xl mx-auto">
      <motion.div 
        className="relative w-full h-[400px] cursor-pointer transform-style-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped(!isFlipped);
          }
        }}
      >
        <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 glass-card">
          <div className="text-5xl font-serif italic text-white mb-4 tracking-tight">{q.word}</div>
          <div className="text-sm text-zinc-400 uppercase tracking-widest font-bold">Tap to reveal definition</div>
        </Card>
        <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center bg-indigo-950/20 border-indigo-500/20">
          <div className="text-3xl font-serif italic text-white mb-6">{q.word}</div>
          <div className="text-xl text-zinc-300 mb-8 leading-relaxed font-medium">{q.def}</div>
          <div className="text-sm text-zinc-400 italic max-w-md">"{q.ex}"</div>
        </Card>
      </motion.div>
      
      <div className="flex justify-center gap-4 mt-12">
        <Button variant="danger" size="lg" className="w-48 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20" onClick={() => handleWrong(q.word, q, true)}>Need Review</Button>
        <Button variant="success" size="lg" className="w-48 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20" onClick={(e) => handleCorrect(q.word, e, true)}>Got It</Button>
      </div>
    </div>
  );
}
