import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Background } from './components/Background';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { ReviewScreen } from './components/screens/ReviewScreen';
import { ConfettiModal } from './components/ui/ConfettiModal';
import { WordDetailModal } from './components/ui/WordDetailModal';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { useGameStore } from './store/useGameStore';
import { WORDS } from './data/words';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [screen, setScreen] = useState<'home' | 'game' | 'results' | 'review'>('home');
  const [mode, setMode] = useState<string>('');
  const [filter, setFilter] = useState<string>('All');
  
  const store = useGameStore();
  const selectedWord = WORDS.find(w => w.word === store.selectedWordForDetail) || null;
  
  // Initialize Firebase Anonymous Auth
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        store.setUid(user.uid);
      } else {
        signInAnonymously(auth as any).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  // Results state
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
    <div className="relative min-h-screen bg-[#0f0f1a] text-[#e8e8f0] font-sans selection:bg-indigo-500/30">
      <Background />
      
      <main className="relative z-10 flex min-h-screen flex-col">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <HomeScreen 
              key="home" 
              onStartGame={(m, f = 'All') => {
                setMode(m);
                setFilter(f);
                setScreen('game');
              }} 
              onShowReview={() => setScreen('review')} 
            />
          )}
          
          {screen === 'game' && (
            <GameScreen 
              key="game" 
              mode={mode} 
              difficultyFilter={filter}
              onQuit={() => setScreen('home')} 
              onEndGame={handleEndGame} 
            />
          )}
          
          {screen === 'results' && (
            <ResultsScreen 
              key="results" 
              score={score} 
              total={total} 
              mode={mode}
              wrongWords={wrongWords}
              onContinue={() => setScreen('home')} 
            />
          )}
          
          {screen === 'review' && (
            <ReviewScreen 
              key="review" 
              onBack={() => setScreen('home')} 
            />
          )}
        </AnimatePresence>
      </main>
      <ConfettiModal />
      <WordDetailModal 
        word={selectedWord} 
        onClose={() => store.setSelectedWordForDetail(null)} 
      />
      <InstallPrompt />
    </div>
  );
}

export default App;
