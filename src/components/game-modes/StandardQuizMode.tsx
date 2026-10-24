import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Word } from '../../data/words';

interface StandardQuizModeProps {
  q: Word;
  mode: string;
  options: Word[];
  answered: boolean;
  selectedWord: string | null;
  onAnswerQuiz: (selected: string, e: React.MouseEvent) => void;
  thematicTag?: string | null;
  nextQuestion: () => void;
}

export default function StandardQuizMode({ q, mode, options, answered, selectedWord, onAnswerQuiz, thematicTag, nextQuestion }: StandardQuizModeProps) {
  return (
    <>
      <Card className="flex flex-col items-center justify-center min-h-[280px] p-8 mb-8 relative overflow-hidden glass-card">
        {(mode === 'quiz' || mode === 'speed' || mode === 'daily' || mode === 'community') && (
          <>
            <h2 className="text-5xl md:text-6xl font-serif italic text-white tracking-tight mb-4 text-center">{q.word}</h2>
            <span className="text-zinc-300 uppercase tracking-widest text-xs font-bold bg-white/5 px-3 py-1 rounded-full">{q.pos}</span>
          </>
        )}
        
        {mode === 'context' && (
          <>
            <div className="flex items-center gap-2 mb-8 w-full justify-center">
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest font-bold">
                {thematicTag}
              </span>
              <div className="h-px bg-white/10 flex-1 ml-4 max-w-[200px]" />
            </div>
            <div className="text-2xl text-white leading-relaxed text-center max-w-xl font-medium font-serif">
              {q.ex.split(new RegExp(`(${q.word})`, 'gi')).map((part, i) => 
                part.toLowerCase() === q.word.toLowerCase() 
                  ? <span key={i} className="inline-block min-w-[120px] border-b-2 border-indigo-400 text-indigo-300 mx-2 px-2 font-bold" />
                  : <span key={i}>{part}</span>
              )}
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto w-full">
        {options.map((opt, i) => {
          const isSelected = selectedWord === opt.word;
          const isCorrect = opt.word === q.word;
          
          let stateClass = '';
          if (answered) {
            if (isCorrect) stateClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02] z-10 relative';
            else if (isSelected) stateClass = 'bg-rose-500/10 border-rose-500/40 text-rose-400 scale-[0.98]';
            else stateClass = 'opacity-40 border-white/5';
          }

          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={(e) => onAnswerQuiz(opt.word, e)}
              className={cn(
                "w-full glass-card rounded-xl p-5 text-left text-base font-medium text-zinc-200 transition-all duration-200 ease-out cursor-pointer",
                !answered && "hover:border-indigo-500/30 hover:bg-[#1a1a1a] hover:scale-[1.01] hover:translate-x-1 active:scale-[0.98]",
                stateClass
              )}
            >
              {mode !== 'context' ? opt.def : (
                <div className="flex flex-col">
                  <span className="font-bold">{opt.word}</span>
                  {answered && (
                    <span className="text-sm text-zinc-300 mt-2 italic font-serif leading-relaxed screen-fade">
                      {opt.def}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {answered && mode === 'context' && (
        <div className="mt-8 flex justify-center w-full screen-fade">
          <Button variant="primary" size="lg" onClick={nextQuestion} className="w-full max-w-xs rounded-xl py-4 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            Next Question
          </Button>
        </div>
      )}
    </>
  );
}
