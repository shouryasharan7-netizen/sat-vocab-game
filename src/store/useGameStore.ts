import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WordMastery {
  correct: number;
  seen: number;
  lastReviewed?: number; // timestamp
  interval?: number; // days
  history?: boolean[]; // last 5 attempts
}

interface GameState {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  lostStreak: number;
  dailyProgress: number;
  lastDailyDate: string;
  totalCorrect: number;
  totalAnswered: number;
  wordMastery: Record<string, WordMastery>;
  achievements: string[];
  showConfettiFor: string | null;
  selectedWordForDetail: string | null;
  
  // Actions
  addXP: (amount: number) => void;
  resetStreak: () => void;
  recoverStreak: () => void;
  incrementStreak: () => void;
  recordAnswer: (word: string, isCorrect: boolean) => void;
  incrementDaily: () => void;
  unlockAchievement: (id: string) => void;
  checkAchievements: () => string[]; // returns newly unlocked achievement IDs
  clearConfetti: () => void;
  setSelectedWordForDetail: (word: string | null) => void;
}

const calculateNextInterval = (currentInterval: number = 0, isCorrect: boolean) => {
  if (!isCorrect) return 1; // Reset to 1 day on failure
  if (currentInterval === 0) return 1;
  if (currentInterval === 1) return 3;
  if (currentInterval === 3) return 7;
  if (currentInterval === 7) return 14;
  return 30; // Max 30 days
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      lostStreak: 0,
      dailyProgress: 0,
      lastDailyDate: new Date().toISOString().split('T')[0],
      totalCorrect: 0,
      totalAnswered: 0,
      wordMastery: {},
      achievements: [],
      showConfettiFor: null,
      selectedWordForDetail: null,

      addXP: (amount) => set((state) => {
        const newXp = state.xp + amount;
        const needed = state.level * 100;
        if (newXp >= needed) {
          return { xp: newXp, level: state.level + 1 };
        }
        return { xp: newXp };
      }),
      
      resetStreak: () => set((state) => ({ 
        streak: 0, 
        lostStreak: state.streak > 1 ? state.streak : 0 
      })),
      
      recoverStreak: () => set((state) => {
        if (state.lostStreak > 0 && state.xp >= 100) {
          return {
            streak: state.lostStreak,
            lostStreak: 0,
            xp: state.xp - 100
          };
        }
        return state;
      }),
      
      incrementStreak: () => set((state) => {
        const newStreak = state.streak + 1;
        return { 
          streak: newStreak, 
          bestStreak: Math.max(state.bestStreak, newStreak) 
        };
      }),
      
      recordAnswer: (word, isCorrect) => set((state) => {
        const currentMastery = state.wordMastery[word] || { correct: 0, seen: 0, interval: 0 };
        
        const newCorrect = currentMastery.correct + (isCorrect ? 1 : 0);
        const newSeen = currentMastery.seen + 1;
        const newInterval = calculateNextInterval(currentMastery.interval, isCorrect);
        
        const currentHistory = currentMastery.history || [];
        const newHistory = [...currentHistory, isCorrect].slice(-5);
        
        // Trigger confetti if this is the 5th correct answer
        let confettiWord = state.showConfettiFor;
        if (isCorrect && newCorrect === 5) {
          confettiWord = word;
        }

        const today = new Date().toISOString().split('T')[0];
        const isNewDay = state.lastDailyDate !== today;
        let newDailyProgress = isNewDay ? 0 : state.dailyProgress;
        
        // We will increment daily progress directly from GameScreen or here if we pass mode.
        // Wait, recordAnswer doesn't know the mode. We can add an incrementDaily action instead.

        return {
          totalAnswered: state.totalAnswered + 1,
          totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
          showConfettiFor: confettiWord,
          lastDailyDate: today,
          dailyProgress: newDailyProgress,
          wordMastery: {
            ...state.wordMastery,
            [word]: {
              seen: newSeen,
              correct: newCorrect,
              lastReviewed: Date.now(),
              interval: newInterval,
              history: newHistory,
            }
          }
        };
      }),
      
      clearConfetti: () => set({ showConfettiFor: null }),
      
      incrementDaily: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const isNewDay = state.lastDailyDate !== today;
        return {
          lastDailyDate: today,
          dailyProgress: isNewDay ? 1 : Math.min(10, state.dailyProgress + 1)
        };
      }),

      setSelectedWordForDetail: (word) => set({ selectedWordForDetail: word }),
      
      unlockAchievement: (id) => set((state) => {
        if (!state.achievements.includes(id)) {
          return { achievements: [...state.achievements, id] };
        }
        return state;
      }),
      
      checkAchievements: () => {
        const state = get();
        const newUnlocks: string[] = [];
        
        const unlock = (id: string) => {
          if (!state.achievements.includes(id) && !newUnlocks.includes(id)) {
            newUnlocks.push(id);
          }
        };

        if (state.totalCorrect >= 1) unlock("first_correct");
        if (state.bestStreak >= 5) unlock("streak_5");
        if (state.bestStreak >= 10) unlock("streak_10");
        
        const mastered = Object.values(state.wordMastery).filter(m => m.correct >= 5).length;
        if (mastered >= 10) unlock("master_10");
        if (mastered >= 50) unlock("master_50");
        
        if (state.level >= 5) unlock("level_5");
        if (state.level >= 10) unlock("level_10");
        
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 5) unlock("night_owl");
        
        newUnlocks.forEach(id => get().unlockAchievement(id));
        return newUnlocks;
      }
    }),
    {
      name: 'satVocabQuest',
    }
  )
);
