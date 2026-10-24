import React, { useState } from 'react';
import { HomeScreen } from './components/screens/HomeScreen';
import { ConfettiModal } from './components/ui/ConfettiModal';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { useGameStore } from './store/useGameStore';

const GameScreen = React.lazy(() => import('./components/screens/GameScreen').then(m => ({ default: m.GameScreen })));
const ResultsScreen = React.lazy(() => import('./components/screens/ResultsScreen').then(m => ({ default: m.ResultsScreen })));
const ReviewScreen = React.lazy(() => import('./components/screens/ReviewScreen').then(m => ({ default: m.ReviewScreen })));
const LeaderboardScreen = React.lazy(() => import('./components/screens/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const WordDetailModal = React.lazy(() => import('./components/ui/WordDetailModal').then(m => ({ default: m.WordDetailModal })));

type Screen = 'home' | 'game' | 'results' | 'review' | 'leaderboard';
type Mode = 'daily' | 'speed' | 'flashcard' | 'contrast' | 'context' | 'scramble' | 'community' | 'quiz' | null;

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

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#fafafa] font-sans selection:bg-violet-500/30 overflow-hidden">
      <main className="relative z-10 flex min-h-screen flex-col">
        <React.Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        }>
          {screen === 'home' && (
            <div key="home" className="flex-1 flex flex-col screen-fade">
              <HomeScreen 
                onStartGame={(m, f = 'All') => {
                  setMode(m as Mode);
                  setFilter(f as any);
                  setScreen('game');
                }} 
                onShowReview={() => setScreen('review')} 
                onShowLeaderboard={() => setScreen('leaderboard')}
              />
            </div>
          )}

          {screen === 'game' && mode && (
            <div key="game" className="flex-1 flex flex-col screen-fade">
              <GameScreen
                mode={mode}
                difficultyFilter={filter}
                onEndGame={handleEndGame}
              />
            </div>
          )}

          {screen === 'results' && (
            <div key="results" className="flex-1 flex flex-col screen-fade">
              <ResultsScreen
                score={score}
                total={total}
                mode={mode || ''}
                wrongWords={wrongWords}
                onContinue={() => setScreen('home')}
              />
            </div>
          )}

          {screen === 'review' && (
            <div key="review" className="flex-1 flex flex-col screen-fade">
              <ReviewScreen
                onBack={() => setScreen('home')}
              />
            </div>
          )}

          {screen === 'leaderboard' && (
            <div key="leaderboard" className="flex-1 flex flex-col screen-fade">
              <LeaderboardScreen onBack={() => setScreen('home')} />
            </div>
          )}
        </React.Suspense>
      </main>

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
