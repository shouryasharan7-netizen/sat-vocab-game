import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Star, Loader2 } from 'lucide-react';
import { fetchTopPlayers } from '../../lib/firebase';
import { useGameStore } from '../../store/useGameStore';
import { cn } from '../ui/Button';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Player {
  uid: string;
  username: string;
  xp: number;
  streak: number;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { uid: currentUid } = useGameStore();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchTopPlayers().then((data) => {
        setPlayers(data as Player[]);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0f0f1a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 pb-6 border-b border-white/5 flex items-start justify-between bg-slate-900/50">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-2xl font-black text-white">Global Leaderboard</h2>
              </div>
              <p className="text-sm text-slate-400 pl-1">The top 50 scholars ranked by XP.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>Loading the elite...</p>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <p>No players found. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((user, i) => {
                  const isUser = user.uid === currentUid;
                  return (
                    <div 
                      key={user.uid} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all", 
                        isUser 
                          ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                          : "bg-slate-800/30 border-transparent hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0", 
                          i === 0 ? "bg-amber-500 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                          : i === 1 ? "bg-slate-300 text-slate-900 shadow-[0_0_10px_rgba(203,213,225,0.5)]" 
                          : i === 2 ? "bg-orange-400 text-orange-950 shadow-[0_0_10px_rgba(251,146,60,0.5)]" 
                          : "bg-slate-800 text-slate-400"
                        )}>
                          {i + 1}
                        </div>
                        <div className="font-bold text-slate-200 truncate max-w-[120px] sm:max-w-[200px]">
                          {user.username} {isUser && <span className="text-indigo-400 text-xs ml-1">(You)</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Flame className={cn("w-4 h-4", user.streak > 0 ? "text-rose-500" : "text-slate-600")} />
                          <span className="font-bold text-sm text-slate-300 w-6">{user.streak}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-sm text-slate-300 w-12 text-right">{user.xp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
