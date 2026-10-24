// Timer and round loop hook for speed runs and timed modes
import { useState, useEffect, useCallback } from 'react';

interface GameLoopOptions {
  totalSeconds: number;
  isTimed: boolean;
  onTimeUp?: () => void;
}

export function useGameLoop({ totalSeconds, isTimed, onTimeUp }: GameLoopOptions) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(isTimed);

  useEffect(() => {
    setIsRunning(isTimed);
  }, [isTimed]);

  useEffect(() => {
    if (!isTimed || !isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isTimed, isRunning, onTimeUp]);

  const resetTimer = useCallback((seconds: number = totalSeconds) => {
    setTimeLeft(seconds);
  }, [totalSeconds]);

  return {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    resetTimer,
  };
}
