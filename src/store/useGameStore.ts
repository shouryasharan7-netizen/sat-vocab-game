import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WordMastery {
  correct: number;
  seen: number;
}

interface GameState {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  wordMastery: Record<string, WordMastery>;
  achievements: string[];
  
  // Actions
  addXP: (amount: number) => void;
  resetStreak: () => void;
  incrementStreak: () => void;
  recordAnswer: (word: string, isCorrect: boolean) => void;
  unlockAchievement: (id: string) => void;
  checkAchievements: () => string[]; // returns newly unlocked achievement IDs
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      wordMastery: {},
      achievements: [],

      addXP: (amount) => set((state) => {
        const newXp = state.xp + amount;
        const needed = state.level * 100;
        if (newXp >= needed) {
          return { xp: newXp, level: state.level + 1 };
        }
        return { xp: newXp };
      }),
      
      resetStreak: () => set({ streak: 0 }),
      
      incrementStreak: () => set((state) => {
        const newStreak = state.streak + 1;
        return { 
          streak: newStreak, 
          bestStreak: Math.max(state.bestStreak, newStreak) 
        };
      }),
      
      recordAnswer: (word, isCorrect) => set((state) => {
        const currentMastery = state.wordMastery[word] || { correct: 0, seen: 0 };
        return {
          totalAnswered: state.totalAnswered + 1,
          totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
          wordMastery: {
            ...state.wordMastery,
            [word]: {
              seen: currentMastery.seen + 1,
              correct: currentMastery.correct + (isCorrect ? 1 : 0),
            }
          }
        };
      }),
      
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
        
        const mastered = Object.values(state.wordMastery).filter(m => m.correct >= 3).length;
        if (mastered >= 10) unlock("master_10");
        if (mastered >= 50) unlock("master_50");
        
        if (state.level >= 5) unlock("level_5");
        if (state.level >= 10) unlock("level_10");
        
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 5) unlock("night_owl");
        
        // Actually unlock them in state
        newUnlocks.forEach(id => get().unlockAchievement(id));
        return newUnlocks;
      }
    }),
    {
      name: 'satVocabQuest',
    }
  )
);
