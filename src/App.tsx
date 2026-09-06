import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { HomeScreen } from './components/screens/HomeScreen';

import { CustomCursor } from './components/ui/CustomCursor';
import { ScrollVelocitySkew } from './components/ui/ScrollVelocitySkew';
import { ConfettiModal } from './components/ui/ConfettiModal';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { useGameStore } from './store/useGameStore';

const GameScreen = React.lazy(() => import('./components/screens/GameScreen').then(m => ({ default: m.GameScreen })));
const ResultsScreen = React.lazy(() => import('./components/screens/ResultsScreen').then(m => ({ default: m.ResultsScreen })));
const ReviewScreen = React.lazy(() => import('./components/screens/ReviewScreen').then(m => ({ default: m.ReviewScreen })));
const LeaderboardScreen = React.lazy(() => import('./components/screens/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const WordDetailModal = React.lazy(() => import('./components/ui/WordDetailModal').then(m => ({ default: m.WordDetailModal })));

type Screen = 'home' | 'game' | 'results' | 'review' | 'leaderboard';
type Mode = 'daily' | 'speed' | 'flashcard' | 'contrast' | 'context' | 'scramble' | null;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<Mode>(null);
  const [filter, setFilter] = useState<'All' | 'Common' | 'Advanced' | 'Obscure'>('All');
  
  const store = useGameStore();



  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [wrongWords, setWrongWords] = useState<string[]>([]);

  const handleEndGame = (finalScore: number, finalTotal: number, finalWrong: string[]) => {
    setScore(finalScore);
    setTotal(finalTotal);
    setWrongWords(finalWrong);
    setScreen('results');
  };

  const pageVariants: any = {
    initial: { opacity: 0, scale: 0.98, y: 10, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.98, y: -10, filter: 'blur(4px)', transition: { duration: 0.25, ease: 'easeIn' } },
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#fafafa] font-sans selection:bg-violet-500/30 overflow-hidden">
      <Analytics />
      <CustomCursor />
      
      <ScrollVelocitySkew>
          <main className="relative z-10 flex min-h-screen flex-col">
            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" /></div>}>
              <AnimatePresence mode="wait">
                {screen === 'home' && (
                  <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
                    <HomeScreen 
                      onStartGame={(m, f = 'All') => {
                        setMode(m as Mode);
                        setFilter(f as any);
                        setScreen('game');
                      }} 
                      onShowReview={() => setScreen('review')} 
                      onShowLeaderboard={() => setScreen('leaderboard')}
                    />
                  </motion.div>
                )}

                {screen === 'game' && mode && (
                  <motion.div key="game" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
                    <GameScreen
                      mode={mode}
                      difficultyFilter={filter}
                      onEndGame={handleEndGame}
                    />
                  </motion.div>
                )}

                {screen === 'results' && (
                  <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
                    <ResultsScreen
                      score={score}
                      total={total}
                      mode={mode || ''}
                      wrongWords={wrongWords}
                      onContinue={() => setScreen('home')}
                    />
                  </motion.div>
                )}

                {screen === 'review' && (
                  <motion.div key="review" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
                    <ReviewScreen
                      onBack={() => setScreen('home')}
                    />
                  </motion.div>
                )}

                {screen === 'leaderboard' && (
                  <motion.div key="leaderboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
                    <LeaderboardScreen onBack={() => setScreen('home')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Suspense>
          </main>
        </ScrollVelocitySkew>
      <ConfettiModal />
      <React.Suspense fallback={null}>
        <WordDetailModal 
          wordId={store.selectedWordForDetail} 
          onClose={() => store.setSelectedWordForDetail(null)} 
        />
      </React.Suspense>
      <InstallPrompt />
    </div>
  );
}
