import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { WORDS, type Word } from '../../data/words';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import { ArrowLeft, Flame, Star, ListChecks } from 'lucide-react';

interface GameScreenProps {
  mode: string;
  onQuit: () => void;
  onEndGame: (score: number, total: number, wrongWords: string[]) => void;
}

export function GameScreen({ mode, onQuit, onEndGame }: GameScreenProps) {
  const store = useGameStore();
  const [questions, setQuestions] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  
  const [answered, setAnswered] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [scrambleInput, setScrambleInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [options, setOptions] = useState<Word[]>([]);
  const [feedback, setFeedback] = useState<{correct: boolean, text: string} | null>(null);
  
  const scrambleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate questions
    const getWeightedWords = (count: number) => {
      const pool = [...WORDS];
      pool.sort((a, b) => {
        const ma = store.wordMastery[a.word] || { correct: 0, seen: 0 };
        const mb = store.wordMastery[b.word] || { correct: 0, seen: 0 };
        const scoreA = ma.seen === 0 ? 2 : ma.correct / ma.seen;
        const scoreB = mb.seen === 0 ? 2 : mb.correct / mb.seen;
        return scoreA - scoreB;
      });
      const selected = pool.slice(0, count).sort(() => Math.random() - 0.5);
      return selected;
    };

    let count = 10;
    if (mode === 'speed') count = 50;
    if (mode === 'flashcard') count = 20;
    
    setQuestions(getWeightedWords(count));
    store.resetStreak();
  }, []);

  useEffect(() => {
    if (questions.length === 0 || currentIndex >= questions.length) return;
    
    const q = questions[currentIndex];
    
    // Generate options for quiz and context
    if (mode === 'quiz' || mode === 'context' || mode === 'speed') {
      const wrong = [...WORDS].filter(w => w.word !== q.word).sort(() => Math.random() - 0.5).slice(0, 3);
      setOptions([...wrong, q].sort(() => Math.random() - 0.5));
    }
    
    if (mode === 'scramble') {
      setTimeout(() => scrambleInputRef.current?.focus(), 100);
    }
    
    setAnswered(false);
    setSelectedWord(null);
    setScrambleInput('');
    setIsFlipped(false);
    setFeedback(null);
  }, [currentIndex, questions, mode]);

  useEffect(() => {
    if (mode !== 'speed') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          onEndGame(score, currentIndex, wrongWords);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [mode, score, currentIndex, wrongWords]);

  const handleCorrect = (word: string, noDelay: boolean = false) => {
    store.incrementStreak();
    store.recordAnswer(word, true);
    setScore(s => s + 1);
    
    const xp = mode === 'speed' ? 5 : 10 + (store.streak > 3 ? 5 : 0);
    store.addXP(xp);
    
    setFeedback({ correct: true, text: '✅ Correct! Keep it up!' });
    
    if (!noDelay && mode !== 'flashcard') {
      setTimeout(() => nextQuestion(), 800);
    } else {
      nextQuestion();
    }
  };

  const handleWrong = (word: string, actualWord: Word, noDelay: boolean = false) => {
    store.resetStreak();
    store.recordAnswer(word, false);
    setWrongWords(prev => [...prev, word]);
    
    setFeedback({ correct: false, text: `❌ The answer was: ${actualWord.word} — ${actualWord.def}` });
    
    if (!noDelay && mode !== 'flashcard') {
      setTimeout(() => nextQuestion(), 1500);
    } else {
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length && mode !== 'speed') {
      onEndGame(score, questions.length, wrongWords);
    } else if (mode === 'speed' && currentIndex + 1 >= questions.length) {
      // Endless mode for speed
      setQuestions(prev => [...prev, ...WORDS.sort(() => Math.random() - 0.5).slice(0, 10)]);
      setCurrentIndex(i => i + 1);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const onAnswerQuiz = (selected: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedWord(selected);
    const q = questions[currentIndex];
    if (selected === q.word) handleCorrect(q.word);
    else handleWrong(q.word, q);
  };

  const onScrambleSubmit = () => {
    if (answered || !scrambleInput.trim()) return;
    setAnswered(true);
    const q = questions[currentIndex];
    if (scrambleInput.trim().toLowerCase() === q.word.toLowerCase()) handleCorrect(q.word);
    else handleWrong(q.word, q);
  };

  if (questions.length === 0) return null;
  const q = questions[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="max-w-2xl mx-auto w-full px-4 py-8 relative z-10"
    >
      <div className="flex justify-between items-center mb-8">
        <Button variant="secondary" size="sm" onClick={onQuit} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Quit
        </Button>
        <div className="flex items-center gap-4 text-sm font-semibold text-[#8888a0]">
          <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-lg border border-orange-500/20">
            <Flame className="w-4 h-4" /> {store.streak}
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-500/20">
            <Star className="w-4 h-4" /> {score}
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            <ListChecks className="w-4 h-4" /> 
            {mode === 'speed' ? currentIndex + 1 : `${currentIndex + 1}/${questions.length}`}
          </div>
        </div>
      </div>

      {mode === 'speed' && (
        <div className="h-1.5 bg-[#0f0f1a] rounded-full overflow-hidden mb-6 border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100 linear"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {feedback && mode !== 'flashcard' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl mb-4 font-semibold text-center text-sm border",
                feedback.correct 
                  ? "bg-green-500/10 text-green-400 border-green-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              )}
            >
              {feedback.text}
            </motion.div>
          )}

          {mode === 'flashcard' ? (
            <div className="perspective-1000 mb-8">
              <motion.div 
                className="relative w-full h-[320px] cursor-pointer transform-style-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front */}
                <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8">
                  {/* Mastery Ring for Flashcard */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Mastery</span>
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                        <circle 
                          cx="16" cy="16" r="14" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          fill="transparent" 
                          strokeDasharray="88"
                          strokeDashoffset={88 - (88 * Math.min(100, ((store.wordMastery[q.word]?.correct || 0) / 5) * 100)) / 100}
                          className="text-indigo-500 transition-all duration-1000"
                        />
                      </svg>
                      <span className="text-[10px] font-bold text-white z-10">{store.wordMastery[q.word]?.correct || 0}</span>
                    </div>
                  </div>

                  <div className="text-5xl font-black text-amber-400 mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(251,191,36,0.2)] font-serif">{q.word}</div>
                  <div className="text-sm text-slate-400">Tap to reveal definition</div>
                </Card>
                {/* Back */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center bg-indigo-950/40 border-indigo-500/30">
                  <div className="text-3xl font-black text-amber-400 mb-4">{q.word}</div>
                  <div className="text-lg text-white mb-6 leading-relaxed">{q.def}</div>
                  <div className="text-sm text-[#8888a0] italic max-w-sm">"{q.ex}"</div>
                </Card>
              </motion.div>
              
              <div className="flex justify-center gap-4 mt-8">
                <Button variant="danger" size="lg" className="w-40" onClick={() => handleWrong(q.word, q, true)}>Didn't Know ❌</Button>
                <Button variant="success" size="lg" className="w-40" onClick={() => handleCorrect(q.word, true)}>Knew It ✅</Button>
              </div>
            </div>
          ) : (
            <>
              <Card className="flex flex-col items-center justify-center min-h-[260px] p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                
                {(mode === 'quiz' || mode === 'speed') && (
                  <>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Mastery</span>
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                          <circle 
                            cx="16" cy="16" r="14" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            fill="transparent" 
                            strokeDasharray="88"
                            strokeDashoffset={88 - (88 * Math.min(100, ((store.wordMastery[q.word]?.correct || 0) / 5) * 100)) / 100}
                            className="text-indigo-500 transition-all duration-1000"
                          />
                        </svg>
                        <span className="text-[10px] font-bold text-white z-10">{store.wordMastery[q.word]?.correct || 0}</span>
                      </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_15px_rgba(251,191,36,0.2)] mb-3 text-center font-serif">{q.word}</h2>
                    <span className="text-slate-400 uppercase tracking-widest text-xs font-bold bg-white/5 px-3 py-1 rounded-full">{q.pos}</span>
                  </>
                )}
                
                {mode === 'context' && (
                  <>
                    <div className="text-xs text-[#8888a0] uppercase tracking-widest font-bold mb-6">Fill in the blank</div>
                    <div className="text-xl text-white leading-relaxed italic text-center max-w-lg font-medium">
                      {q.ex.split(new RegExp(`(${q.word})`, 'gi')).map((part, i) => 
                        part.toLowerCase() === q.word.toLowerCase() 
                          ? <span key={i} className="inline-block min-w-[100px] border-b-2 border-indigo-400 text-indigo-300 mx-1 px-2 font-bold not-italic" />
                          : <span key={i}>{part}</span>
                      )}
                    </div>
                  </>
                )}

                {mode === 'scramble' && (
                  <>
                    <div className="text-xs text-[#8888a0] uppercase tracking-widest font-bold mb-6">Unscramble this word</div>
                    <div className="text-4xl font-black text-white tracking-[0.25em] mb-4 text-center">
                      {q.word.split('').sort(() => Math.random() - 0.5).join('')}
                    </div>
                    <div className="text-sm text-indigo-300 text-center">{q.def}</div>
                  </>
                )}
              </Card>

              {mode === 'scramble' ? (
                <div className="flex flex-col gap-4">
                  <input
                    ref={scrambleInputRef}
                    type="text"
                    value={scrambleInput}
                    onChange={(e) => setScrambleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onScrambleSubmit()}
                    placeholder="Type the word..."
                    className="w-full bg-[#1a1a2e]/80 border border-white/10 rounded-xl p-5 text-center text-xl font-bold tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all backdrop-blur-xl"
                    disabled={answered}
                  />
                  <Button variant="primary" size="lg" onClick={onScrambleSubmit} disabled={answered}>Submit Answer</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {options.map((opt, i) => {
                    const isSelected = selectedWord === opt.word;
                    const isCorrect = opt.word === q.word;
                    
                    let stateClass = '';
                    if (answered) {
                      if (isCorrect) stateClass = 'bg-green-500/15 border-green-500/40 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.15)] scale-[1.02]';
                      else if (isSelected) stateClass = 'bg-red-500/15 border-red-500/40 text-red-300 scale-[0.98]';
                      else stateClass = 'opacity-50';
                    }

                    return (
                      <motion.button
                        key={i}
                        disabled={answered}
                        onClick={() => onAnswerQuiz(opt.word)}
                        whileHover={!answered ? { scale: 1.01, y: -2 } : {}}
                        whileTap={!answered ? { scale: 0.98 } : {}}
                        className={cn(
                          "w-full bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/5 rounded-xl p-5 text-left text-[15px] font-medium text-[#e8e8f0] transition-all duration-300 ease-out hover:border-indigo-500/30 hover:bg-[#252542]",
                          stateClass
                        )}
                      >
                        {mode === 'quiz' || mode === 'speed' ? opt.def : opt.word}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
