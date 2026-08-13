import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import type { Word } from '../../data/words';

interface ScrambleModeProps {
  q: Word;
  answered: boolean;
  scrambleInput: string;
  setScrambleInput: (val: string) => void;
  onScrambleSubmit: () => void;
}

export default function ScrambleMode({ q, answered, scrambleInput, setScrambleInput, onScrambleSubmit }: ScrambleModeProps) {
  const scrambleInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <>
      <Card className="flex flex-col items-center justify-center min-h-[280px] p-8 mb-8 relative overflow-hidden glass-card">
        <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-8">Unscramble this word</div>
        <div className="text-5xl font-mono text-white tracking-[0.25em] mb-6 text-center uppercase">
          {q.word.split('').sort(() => Math.random() - 0.5).join('')}
        </div>
        <div className="text-lg text-zinc-400 text-center font-serif italic max-w-md">{q.def}</div>
      </Card>
      
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <div className="relative">
          <input
            ref={scrambleInputRef}
            type="text"
            value={scrambleInput}
            onChange={(e) => setScrambleInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onScrambleSubmit()}
            placeholder="Type the word..."
            autoFocus
            className={cn(
              "w-full bg-[#141414] border-2 rounded-2xl p-6 text-center text-2xl font-mono tracking-widest text-white placeholder:text-zinc-700 focus:outline-none transition-all",
              answered 
                ? scrambleInput.trim().toLowerCase() === q.word.toLowerCase()
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                  : "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            )}
            disabled={answered}
          />
          {answered && scrambleInput.trim().toLowerCase() !== q.word.toLowerCase() && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-10 left-0 right-0 text-center font-mono font-bold text-emerald-400 text-lg tracking-widest"
            >
              {q.word}
            </motion.div>
          )}
        </div>
        <Button variant="primary" size="lg" onClick={onScrambleSubmit} disabled={answered} className={cn("h-16 text-lg rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.2)] mt-4", answered && "opacity-0")}>Submit Answer</Button>
      </div>
    </>
  );
}
