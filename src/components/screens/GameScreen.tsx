import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { WORDS, type Word } from '../../data/words';
import { Button, cn } from '../ui/Button';
import { ArrowLeft, Flame, Star, ListChecks } from 'lucide-react';

const FlashcardMode = lazy(() => import('../game-modes/FlashcardMode'));
const ScrambleMode = lazy(() => import('../game-modes/ScrambleMode'));
const ContrastMode = lazy(() => import('../game-modes/ContrastMode'));
const StandardQuizMode = lazy(() => import('../game-modes/StandardQuizMode'));

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
      // autoFocus handles this inside ScrambleMode now
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
      className="max-w-3xl mx-auto w-full px-4 py-4 md:py-8 relative z-10 min-h-screen flex flex-col pt-8"
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden rounded-t-lg">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 transition-all duration-500 ease-out" 
          style={{ width: `${mode === 'speed' ? (currentIndex / 50) * 100 : (currentIndex / questions.length) * 100}%` }} 
        />
      </div>
      <div className="flex justify-between items-start md:items-center mb-4 md:mb-8 gap-4 mt-2">
        <Button variant="secondary" size="sm" onClick={() => endGameSession(score, currentIndex, wrongWords)} className="gap-2 glass-pill text-zinc-300 hover:text-white shrink-0">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Quit</span>
        </Button>
        <div className="flex flex-wrap justify-end items-center gap-2 md:gap-4 text-xs md:text-sm font-semibold text-zinc-400">
          
          <div className="relative group">
            <div className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-zinc-200">
              <Flame className={cn("w-4 h-4 transition-all duration-300", store.streak > 0 ? "text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110" : "text-zinc-400")} /> 
              <span className={cn("font-bold", store.streak > 0 && "text-amber-400")}>{store.streak}</span>
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
            <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" /></div>}>
              {mode === 'flashcard' ? (
                <FlashcardMode q={q} isFlipped={isFlipped} setIsFlipped={setIsFlipped} handleWrong={handleWrong} handleCorrect={handleCorrect} />
              ) : mode === 'scramble' ? (
                <ScrambleMode q={q} answered={answered} scrambleInput={scrambleInput} setScrambleInput={setScrambleInput} onScrambleSubmit={onScrambleSubmit} />
              ) : mode === 'contrast' ? (
                <ContrastMode q={q} contrastTarget={contrastTarget} contrastOptions={contrastOptions} answered={answered} onContrastSubmit={onContrastSubmit} />
              ) : (
                <StandardQuizMode q={q} mode={mode} options={options} answered={answered} selectedWord={selectedWord} onAnswerQuiz={onAnswerQuiz} thematicTag={thematicTag} nextQuestion={nextQuestion} />
              )}
            </Suspense>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
