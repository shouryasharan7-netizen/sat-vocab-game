import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { cn } from '../ui/Button';
import type { Word } from '../../data/words';

interface ContrastModeProps {
  q: Word;
  contrastTarget: 'synonym' | 'antonym';
  contrastOptions: { text: string; isCorrect: boolean }[];
  answered: boolean;
  onContrastSubmit: (isCorrect: boolean, e: React.MouseEvent) => void;
}

export default function ContrastMode({ q, contrastTarget, contrastOptions, answered, onContrastSubmit }: ContrastModeProps) {
  return (
    <>
      <Card className="flex flex-col items-center justify-center min-h-[280px] p-8 mb-8 relative overflow-hidden glass-card">
        <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-8">
          Contrast Match
        </div>
        <div className="text-xl text-zinc-400 mb-4 font-medium">Find the <span className={cn("font-black", contrastTarget === 'synonym' ? "text-cyan-400" : "text-amber-400")}>{contrastTarget.toUpperCase()}</span> for</div>
        <h2 className="text-5xl font-serif italic text-white tracking-tight mb-6 text-center">{q.word}</h2>
        <div className="text-base text-zinc-400 max-w-sm text-center">{q.def}</div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {contrastOptions.map((opt, i) => {
          let stateClass = i === 0 
            ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-100 hover:bg-cyan-500/10" 
            : "bg-amber-500/5 border-amber-500/20 text-amber-100 hover:bg-amber-500/10";
          
          if (answered) {
            if (opt.isCorrect) stateClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02]';
            else stateClass = 'bg-rose-500/10 border-rose-500/40 text-rose-400 opacity-50 scale-[0.98]';
          }

          return (
            <motion.button
              key={i}
              disabled={answered}
              onClick={(e: any) => onContrastSubmit(opt.isCorrect, e)}
              whileHover={!answered ? { scale: 1.02, y: -2 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              className={cn(
                "w-full glass-card rounded-2xl p-8 text-center text-xl font-bold transition-all duration-300 ease-out flex items-center justify-center min-h-[140px]",
                stateClass
              )}
            >
              {opt.text}
            </motion.button>
          );
        })}
      </div>
    </>
  );
}
