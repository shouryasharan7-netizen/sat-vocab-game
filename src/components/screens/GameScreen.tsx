import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { WORDS, type Word } from '../../data/words';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import { ArrowLeft, Flame, Star, ListChecks } from 'lucide-react';

interface GameScreenProps {
  mode: string;
  difficultyFilter?: string;
  onEndGame: (score: number, total: number, wrongWords: string[]) => void;
}

export function GameScreen({ mode, difficultyFilter = 'All', onEndGame }: GameScreenProps) {
  const store = useGameStore();
  const [questions, setQuestions] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionXpRef = useRef(0);
  const [countdown, setCountdown] = useState<number | null>(mode === 'speed' ? 3 : null);
  
  const [answered, setAnswered] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [scrambleInput, setScrambleInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [options, setOptions] = useState<Word[]>([]);
  
  // Contrast Match State
  const [contrastTarget, setContrastTarget] = useState<'synonym' | 'antonym'>('synonym');
  const [contrastOptions, setContrastOptions] = useState<{text: string, isCorrect: boolean}[]>([]);
  
  const scrambleInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // New states for streak overlays and shaking
  const [streakOverlay, setStreakOverlay] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  useEffect(() => {
    const getWeightedWords = (count: number) => {
      let pool = [...WORDS];
      
      if (difficultyFilter !== 'All') {
        pool = pool.filter(w => {
          const len = w.word.length;
          const hasRare = /[qzx]/i.test(w.word);
          const diff = len <= 6 && !hasRare ? 'Common' : (len >= 10 || hasRare) ? 'Obscure' : 'Advanced';
          return diff === difficultyFilter;
        });
        if (pool.length === 0) pool = [...WORDS]; 
      }

      if (mode === 'contrast') {
        pool = pool.filter(w => w.synonyms && w.synonyms.length > 0 && w.antonyms && w.antonyms.length > 0);
      }
      pool.sort(() => Math.random() - 0.5); // Shuffle first
      pool.sort((a, b) => {
        const ma = store.wordMastery[a.word] || { correct: 0, seen: 0 };
        const mb = store.wordMastery[b.word] || { correct: 0, seen: 0 };
        
        // Add random jitter to prevent deterministic repetition
        const scoreA = ma.seen === 0 ? Math.random() * 0.5 : (ma.correct / ma.seen) + (Math.random() * 0.4);
        const scoreB = mb.seen === 0 ? Math.random() * 0.5 : (mb.correct / mb.seen) + (Math.random() * 0.4);
        return scoreA - scoreB;
      });
      if (pool.length < count && mode === 'contrast') {
        const extra = [...WORDS].filter(w => !pool.includes(w));
        pool.push(...extra);
      }
      return pool.slice(0, count).sort(() => Math.random() - 0.5);
    };

    let count = 10;
    if (mode === 'speed') count = 50;
    if (mode === 'flashcard') count = 20;
    if (mode === 'daily') count = 10;
    
    if (mode === 'community') {
      fetch('/api/analytics')
        .then(res => res.json())
        .then(data => {
          let selected: any[] = [];
          if (data.words && data.words.length > 0) {
            const communityWords = data.words.map((w: any) => WORDS.find(word => word.word === w.word)).filter(Boolean);
            selected = [...communityWords];
          }
          // Fill the rest with weighted random words if we don't have 10 community words
          if (selected.length < 10) {
            const fill = getWeightedWords(10 - selected.length).filter(w => !selected.find(s => s.word === w.word));
            selected = [...selected, ...fill].slice(0, 10);
          }
          setQuestions(selected.length > 0 ? selected : getWeightedWords(10));
        })
        .catch(() => setQuestions(getWeightedWords(10)));
    } else {
      setQuestions(getWeightedWords(count));
    }
    
    store.resetStreak();

    // Start anti-cheat session
    fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', uid: store.uid })
    })
      .then(res => res.json())
      .then(data => {
        if (data.sessionId) setSessionId(data.sessionId);
      })
      .catch(console.error);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (questions.length === 0 || currentIndex >= questions.length) return;
    
    const q = questions[currentIndex];
    
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
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [mode, countdown]);

  const scoreRef = useRef(score);
  const wrongWordsRef = useRef(wrongWords);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { wrongWordsRef.current = wrongWords; }, [wrongWords]);

  useEffect(() => {
    if (timeLeft === 0 && mode === 'speed') {
      endGameSession(scoreRef.current, currentIndex, wrongWordsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length && mode !== 'speed') {
      endGameSession(scoreRef.current, questions.length, wrongWordsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length, mode]);

  const endGameSession = async (finalScore: number, total: number, mistakes: string[]) => {
    // 1. Report Analytics
    if (mistakes.length > 0) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failedWords: mistakes })
      }).catch(console.error);
    }

    // 2. Commit XP securely
    if (sessionId && sessionXpRef.current > 0) {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          sessionId,
          uid: store.uid,
          username: store.username,
          xpGained: sessionXpRef.current,
          totalXp: store.xp
        })
      }).catch(console.error);
    }

    // 3. Save cloud state
    store.syncToCloud();

    onEndGame(finalScore, total, mistakes);
  };

  const triggerConfetti = (e?: React.MouseEvent) => {
    if (e) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#10b981', '#34d399', '#ffffff']
      });
    } else {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const showStreakOverlay = (text: string) => {
    setStreakOverlay(text);
    setTimeout(() => setStreakOverlay(null), 1500);
  };

  const handleCorrect = (word: string, e?: React.MouseEvent, noDelay: boolean = false) => {
    const oldStreak = store.streak;
    store.incrementStreak();
    store.recordAnswer(word, true);
    setScore(s => s + 1);
    
    const xpGain = mode === 'speed' ? 5 : 10 + (store.streak > 3 ? 5 : 0);
    store.addXP(xpGain);
    sessionXpRef.current += xpGain;
    
    if (mode === 'daily') store.incrementDaily();
    
    triggerConfetti(e);
    
    if (oldStreak === 4) {
      showStreakOverlay('UNSTOPPABLE');
    }

    if (!noDelay && mode !== 'flashcard' && mode !== 'context') {
      setTimeout(() => nextQuestion(), 800);
    } else if (mode !== 'context') {
      nextQuestion();
    }
  };

  const handleWrong = (word: string, _actualWord?: Word, noDelay: boolean = false) => {
    if (store.streak >= 5) {
      showStreakOverlay('BROKEN');
    }
    store.resetStreak();
    store.recordAnswer(word, false);
    setWrongWords(prev => [...prev, word]);
    
    if (mode === 'daily') store.incrementDaily();
    
    setShakeTrigger(prev => prev + 1); // trigger shake animation
    
    if (!noDelay && mode !== 'flashcard' && mode !== 'context') {
      setTimeout(() => nextQuestion(), 1500);
    } else if (mode !== 'context') {
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    if (mode === 'speed' && currentIndex + 1 >= questions.length) {
      setQuestions(prev => [...prev, ...WORDS.sort(() => Math.random() - 0.5).slice(0, 10)]);
    }
    setCurrentIndex(i => i + 1);
  };

  const onAnswerQuiz = (selected: string, e: React.MouseEvent) => {
    if (answered) return;
    setAnswered(true);
    setSelectedWord(selected);
    const q = questions[currentIndex];
    if (selected === q.word) handleCorrect(q.word, e);
    else handleWrong(q.word, q);
  };

  const onScrambleSubmit = () => {
    if (answered || !scrambleInput.trim()) return;
    setAnswered(true);
    const q = questions[currentIndex];
    if (scrambleInput.trim().toLowerCase() === q.word.toLowerCase()) handleCorrect(q.word);
    else handleWrong(q.word, q);
  };

  const onContrastSubmit = (isCorrect: boolean, e: React.MouseEvent) => {
    if (answered) return;
    setAnswered(true);
    const q = questions[currentIndex];
    if (isCorrect) handleCorrect(q.word, e);
    else handleWrong(q.word, q);
  };

  if (questions.length === 0) return null;
  const q = questions[currentIndex];
  if (!q) return null; 

  const THEMATIC_TAGS = ['SCIENCE & NATURE', 'HISTORY & SOCIETY', 'LITERATURE & ARTS', 'GLOBAL ISSUES', 'ECONOMICS'];
  const thematicTag = mode === 'context' ? THEMATIC_TAGS[currentIndex % THEMATIC_TAGS.length] : null;

  if (countdown !== null) {
    return (
      <div className="flex-1 flex flex-col pt-12 items-center justify-center px-4 relative z-10 w-full min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5, duration: 0.6 } }}
            exit={{ scale: 2, opacity: 0, transition: { duration: 0.3 } }}
            className="text-[12rem] font-black text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.3)] tabular-nums"
          >
            {countdown > 0 ? countdown : 'GO!'}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Timer SVG values
  const strokeDasharray = 283;
  const strokeDashoffset = 283 - (283 * (timeLeft / 60));
  let timerColor = "#10b981"; // emerald
  if (timeLeft < 20) timerColor = "#f59e0b"; // amber
  if (timeLeft < 10) timerColor = "#f43f5e"; // rose

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
      className="max-w-3xl mx-auto w-full px-4 py-4 md:py-8 relative z-10 min-h-screen flex flex-col"
    >
      <div className="flex justify-between items-start md:items-center mb-4 md:mb-8 gap-4">
        <Button variant="secondary" size="sm" onClick={() => endGameSession(score, currentIndex, wrongWords)} className="gap-2 glass-pill text-zinc-300 hover:text-white shrink-0">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Quit</span>
        </Button>
        <div className="flex flex-wrap justify-end items-center gap-2 md:gap-4 text-xs md:text-sm font-semibold text-zinc-400">
          
          <div className="relative group">
            <div className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-zinc-200">
              <Flame className={cn("w-4 h-4", store.streak >= 3 ? "text-amber-500 animate-pulse" : "text-zinc-500")} /> {store.streak}
            </div>
            {/* Cinematic Overlay */}
            <AnimatePresence>
              {streakOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -30, scale: 1 }}
                  exit={{ opacity: 0, y: -40, scale: 1.1 }}
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 font-black text-xl tracking-widest whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]",
                    streakOverlay === 'UNSTOPPABLE' ? "text-amber-400" : "text-rose-500"
                  )}
                >
                  {streakOverlay}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-zinc-200">
            <Star className="w-4 h-4 text-emerald-400" /> {score}
          </div>
          <div className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-zinc-200">
            <ListChecks className="w-4 h-4 text-indigo-400" /> 
            {mode === 'speed' ? currentIndex + 1 : `${currentIndex + 1}/${questions.length}`}
          </div>
        </div>
      </div>

      {mode === 'speed' && (
        <div className="flex justify-center mb-12">
          <div className={cn("relative w-24 h-24 flex items-center justify-center", timeLeft <= 10 && "animate-pulse")}>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="45" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
              <motion.circle 
                cx="48" cy="48" r="45" 
                stroke={timerColor}
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-colors duration-500"
              />
            </svg>
            <div className="text-2xl font-mono font-bold tabular-nums text-white z-10">{Math.ceil(timeLeft)}</div>
            {timeLeft <= 10 && (
              <div className="absolute inset-0 rounded-full border border-rose-500/50 animate-ping" />
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 flex flex-col justify-center pb-20"
        >
          <motion.div
            animate={shakeTrigger ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {mode === 'flashcard' ? (
              <div className="perspective-1000 mb-8 w-full max-w-xl mx-auto">
                <motion.div 
                  className="relative w-full h-[400px] cursor-pointer transform-style-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 glass-card">
                    <div className="text-5xl font-serif italic text-white mb-4 tracking-tight">{q.word}</div>
                    <div className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Tap to reveal definition</div>
                  </Card>
                  <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center bg-indigo-950/20 border-indigo-500/20">
                    <div className="text-3xl font-serif italic text-white mb-6">{q.word}</div>
                    <div className="text-xl text-zinc-300 mb-8 leading-relaxed font-medium">{q.def}</div>
                    <div className="text-sm text-zinc-500 italic max-w-md">"{q.ex}"</div>
                  </Card>
                </motion.div>
                
                <div className="flex justify-center gap-4 mt-12">
                  <Button variant="danger" size="lg" className="w-48 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20" onClick={() => handleWrong(q.word, q, true)}>Need Review</Button>
                  <Button variant="success" size="lg" className="w-48 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20" onClick={(e) => handleCorrect(q.word, e, true)}>Got It</Button>
                </div>
              </div>
            ) : (
              <>
                <Card ref={cardRef} className="flex flex-col items-center justify-center min-h-[280px] p-8 mb-8 relative overflow-hidden glass-card">
                  {(mode === 'quiz' || mode === 'speed') && (
                    <>
                      <h2 className="text-5xl md:text-6xl font-serif italic text-white tracking-tight mb-4 text-center">{q.word}</h2>
                      <span className="text-zinc-500 uppercase tracking-widest text-xs font-bold bg-white/5 px-3 py-1 rounded-full">{q.pos}</span>
                    </>
                  )}
                  
                  {mode === 'context' && (
                    <>
                      <div className="flex items-center gap-2 mb-8">
                        <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest font-bold">
                          {thematicTag}
                        </span>
                        <div className="h-px bg-white/10 flex-1 ml-4" />
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

                  {mode === 'scramble' && (
                    <>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-8">Unscramble this word</div>
                      <div className="text-5xl font-mono text-white tracking-[0.25em] mb-6 text-center uppercase">
                        {q.word.split('').sort(() => Math.random() - 0.5).join('')}
                      </div>
                      <div className="text-lg text-zinc-400 text-center font-serif italic max-w-md">{q.def}</div>
                    </>
                  )}
                  
                  {mode === 'contrast' && (
                    <>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-8">
                        Contrast Match
                      </div>
                      <div className="text-xl text-zinc-400 mb-4 font-medium">Find the <span className={cn("font-black", contrastTarget === 'synonym' ? "text-cyan-400" : "text-amber-400")}>{contrastTarget.toUpperCase()}</span> for</div>
                      <h2 className="text-5xl font-serif italic text-white tracking-tight mb-6 text-center">{q.word}</h2>
                      <div className="text-base text-zinc-500 max-w-sm text-center">{q.def}</div>
                    </>
                  )}
                </Card>

                {/* Answer Options */}
                {mode === 'scramble' ? (
                  <div className="flex flex-col gap-4 max-w-md mx-auto">
                    <div className="relative">
                      <input
                        ref={scrambleInputRef}
                        type="text"
                        value={scrambleInput}
                        onChange={(e) => setScrambleInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onScrambleSubmit()}
                        placeholder="Type the word..."
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
                ) : mode === 'contrast' ? (
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
                ) : (
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
                        <motion.button
                          key={i}
                          disabled={answered}
                          onClick={(e: any) => onAnswerQuiz(opt.word, e)}
                          whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                          whileTap={!answered ? { scale: 0.98 } : {}}
                          className={cn(
                            "w-full glass-card rounded-xl p-5 text-left text-base font-medium text-zinc-300 transition-all duration-300 ease-out hover:border-indigo-500/30 hover:bg-[#1a1a1a]",
                            stateClass
                          )}
                        >
                          {mode === 'quiz' || mode === 'speed' ? opt.def : (
                            <div className="flex flex-col">
                              <span className="font-bold">{opt.word}</span>
                              {answered && mode === 'context' && (
                                <motion.span 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="text-sm text-zinc-400 mt-2 italic font-serif leading-relaxed"
                                >
                                  {opt.def}
                                </motion.span>
                              )}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
                {answered && mode === 'context' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-center w-full"
                  >
                    <Button variant="primary" size="lg" onClick={nextQuestion} className="w-full max-w-xs rounded-xl py-4 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                      Next Question
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
