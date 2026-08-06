import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { WORDS, type Word } from '../../data/words';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import { ArrowLeft, Flame, Star, ListChecks, Info } from 'lucide-react';

interface GameScreenProps {
  mode: string;
  difficultyFilter?: string;
  onQuit: () => void;
  onEndGame: (score: number, total: number, wrongWords: string[]) => void;
}

export function GameScreen({ mode, difficultyFilter = 'All', onQuit, onEndGame }: GameScreenProps) {
  const store = useGameStore();
  const [questions, setQuestions] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  
  const [countdown, setCountdown] = useState<number | null>(mode === 'speed' ? 3 : null);
  
  const [answered, setAnswered] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [scrambleInput, setScrambleInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [options, setOptions] = useState<Word[]>([]);
  const [feedback, setFeedback] = useState<{correct: boolean, text: string} | null>(null);
  
  // Contrast Match State
  const [contrastTarget, setContrastTarget] = useState<'synonym' | 'antonym'>('synonym');
  const [contrastOptions, setContrastOptions] = useState<{text: string, isCorrect: boolean}[]>([]);
  
  const scrambleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate questions
    const getWeightedWords = (count: number) => {
      let pool = [...WORDS];
      
      if (difficultyFilter !== 'All') {
        pool = pool.filter(w => {
          const len = w.word.length;
          // Improved heuristic: Common words are short, Obscure words are very long or contain rare letters like x, z, q
          const hasRare = /[qzx]/i.test(w.word);
          const diff = len <= 6 && !hasRare ? 'Common' : (len >= 10 || hasRare) ? 'Obscure' : 'Advanced';
          return diff === difficultyFilter;
        });
        if (pool.length === 0) pool = [...WORDS]; // fallback
      }

      if (mode === 'contrast') {
        pool = pool.filter(w => w.synonyms && w.synonyms.length > 0 && w.antonyms && w.antonyms.length > 0);
      }
      pool.sort((a, b) => {
        const ma = store.wordMastery[a.word] || { correct: 0, seen: 0 };
        const mb = store.wordMastery[b.word] || { correct: 0, seen: 0 };
        // Give un-seen words a random high score so they are mixed in
        const scoreA = ma.seen === 0 ? 2 + Math.random() : (ma.correct / ma.seen);
        const scoreB = mb.seen === 0 ? 2 + Math.random() : (mb.correct / mb.seen);
        return scoreA - scoreB;
      });
      // Fallback if not enough contrast words
      if (pool.length < count && mode === 'contrast') {
        const extra = [...WORDS].filter(w => !pool.includes(w));
        pool.push(...extra);
      }
      const selected = pool.slice(0, count).sort(() => Math.random() - 0.5);
      return selected;
    };

    let count = 10;
    if (mode === 'speed') count = 50;
    if (mode === 'flashcard') count = 20;
    if (mode === 'daily') count = 10;
    
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
    
    if (mode === 'contrast') {
      const askSyn = Math.random() > 0.5;
      setContrastTarget(askSyn ? 'synonym' : 'antonym');
      
      const syn = q.synonyms && q.synonyms.length > 0 ? q.synonyms[Math.floor(Math.random() * q.synonyms.length)] : q.def;
      const ant = q.antonyms && q.antonyms.length > 0 ? q.antonyms[Math.floor(Math.random() * q.antonyms.length)] : q.ex;
      
      setContrastOptions([
        { text: syn, isCorrect: askSyn },
        { text: ant, isCorrect: !askSyn }
      ].sort(() => Math.random() - 0.5));
    }
    
    setAnswered(false);
    setSelectedWord(null);
    setScrambleInput('');
    setIsFlipped(false);
    setFeedback(null);
  }, [currentIndex, questions, mode]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
    }
  }, [countdown]);

  useEffect(() => {
    if (mode !== 'speed' || countdown !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          // score and wrongWords are captured in this interval closure, so they might be stale!
          // We can use a ref for latest values if we need to, or rely on functional updates.
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [mode, countdown]);

  // Use refs to get latest state for endgame
  const scoreRef = useRef(score);
  const wrongWordsRef = useRef(wrongWords);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { wrongWordsRef.current = wrongWords; }, [wrongWords]);

  useEffect(() => {
    if (timeLeft === 0 && mode === 'speed') {
      onEndGame(scoreRef.current, currentIndex, wrongWordsRef.current);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length && mode !== 'speed') {
      onEndGame(scoreRef.current, questions.length, wrongWordsRef.current);
    }
  }, [currentIndex, questions.length, mode, onEndGame]);

  const handleCorrect = (word: string, noDelay: boolean = false) => {
    store.incrementStreak();
    store.recordAnswer(word, true);
    setScore(s => s + 1);
    
    const xp = mode === 'speed' ? 5 : 10 + (store.streak > 3 ? 5 : 0);
    store.addXP(xp);
    
    if (mode === 'daily') store.incrementDaily();
    
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
    
    if (mode === 'daily') store.incrementDaily();
    
    setFeedback({ correct: false, text: `❌ The answer was: ${actualWord.word} — ${actualWord.def}` });
    
    if (!noDelay && mode !== 'flashcard') {
      setTimeout(() => nextQuestion(), 1500);
    } else {
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    if (mode === 'speed' && currentIndex + 1 >= questions.length) {
      // Endless mode for speed
      setQuestions(prev => [...prev, ...WORDS.sort(() => Math.random() - 0.5).slice(0, 10)]);
    }
    setCurrentIndex(i => i + 1);
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

  const onContrastSubmit = (isCorrect: boolean) => {
    if (answered) return;
    setAnswered(true);
    const q = questions[currentIndex];
    if (isCorrect) handleCorrect(q.word);
    else handleWrong(q.word, q);
  };

  if (questions.length === 0) return null;
  const q = questions[currentIndex];
  if (!q) return null; // Wait for onEndGame to trigger


  const THEMATIC_TAGS = ['SCIENCE & NATURE', 'HISTORY & SOCIETY', 'LITERATURE & ARTS', 'GLOBAL ISSUES', 'ECONOMICS'];
  const thematicTag = mode === 'context' ? THEMATIC_TAGS[currentIndex % THEMATIC_TAGS.length] : null;

  if (countdown !== null) {
    return (
      <div className="flex-1 flex flex-col pt-12 items-center justify-center px-4 relative z-10 w-full min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5 } }}
            exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.2 } }}
            className="text-9xl font-black text-amber-400 font-serif drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
          >
            {countdown > 0 ? countdown : 'GO!'}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
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
        <div className="h-1.5 bg-[#0f0f1a] rounded-full overflow-hidden mb-6 border border-white/5 relative">
          <div 
            className={cn(
              "h-full transition-all duration-100 linear",
              timeLeft <= 10 ? "bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" : "bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            )}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.setSelectedWordForDetail(q.word);
                      }}
                      className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="View Details"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] text-slate-500 font-bold uppercase ml-2">Mastery</span>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          store.setSelectedWordForDetail(q.word);
                        }}
                        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="View Details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <span className="text-[10px] text-slate-500 font-bold uppercase ml-2">Mastery</span>
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
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md uppercase tracking-widest font-bold border border-indigo-500/20">
                        {thematicTag}
                      </span>
                      <div className="h-px bg-white/10 flex-1" />
                      <div className="text-xs text-[#8888a0] uppercase tracking-widest font-bold">Fill in the blank</div>
                    </div>
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
                
                {mode === 'contrast' && (
                  <>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          store.setSelectedWordForDetail(q.word);
                        }}
                        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="View Details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      <span className="text-[10px] text-slate-500 font-bold uppercase ml-2">Mastery</span>
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
                    <div className="text-xs text-[#8888a0] uppercase tracking-widest font-bold mb-6 mt-4">
                      Contrast Match
                    </div>
                    <div className="text-xl text-slate-300 mb-2">Find the <span className={cn("font-black", contrastTarget === 'synonym' ? "text-cyan-400" : "text-orange-400")}>{contrastTarget.toUpperCase()}</span> for</div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 text-center font-serif">{q.word}</h2>
                    <div className="text-sm text-slate-400 max-w-sm text-center">{q.def}</div>
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
              ) : mode === 'contrast' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contrastOptions.map((opt, i) => {
                    // For contrast, I'll just use a simple styling: one is cyan, one is orange originally.
                    let stateClass = i === 0 ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-100 hover:bg-cyan-500/20" : "bg-orange-500/10 border-orange-500/20 text-orange-100 hover:bg-orange-500/20";
                    
                    if (answered) {
                      if (opt.isCorrect) stateClass = 'bg-green-500/15 border-green-500/40 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.15)] scale-[1.02]';
                      else stateClass = 'bg-red-500/15 border-red-500/40 text-red-300 opacity-50 scale-[0.98]';
                    }

                    return (
                      <motion.button
                        key={i}
                        disabled={answered}
                        onClick={() => onContrastSubmit(opt.isCorrect)}
                        whileHover={!answered ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!answered ? { scale: 0.98 } : {}}
                        className={cn(
                          "w-full backdrop-blur-xl border-2 rounded-2xl p-6 text-center text-xl font-bold transition-all duration-300 ease-out flex items-center justify-center min-h-[120px]",
                          stateClass
                        )}
                      >
                        {opt.text}
                      </motion.button>
                    );
                  })}
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
