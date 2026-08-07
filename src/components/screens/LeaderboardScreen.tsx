import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Card } from '../ui/Card';
import { Button, cn } from '../ui/Button';
import { ArrowLeft, Trophy, Medal, Crown, Edit2, Check, RefreshCw } from 'lucide-react';

interface Player {
  uid: string;
  username: string;
  xp: number;
  streak: number;
}

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const store = useGameStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(store.username);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSaveName = () => {
    if (editNameValue.trim() && editNameValue !== store.username) {
      store.setUsername(editNameValue.trim());
    }
    setIsEditingName(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
      className="max-w-4xl mx-auto w-full px-4 py-8 relative z-10 min-h-screen"
    >
      <div className="flex justify-between items-center mb-10">
        <Button variant="secondary" size="sm" onClick={onBack} className="gap-2 glass-pill text-zinc-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2 font-bold text-sm bg-amber-500/10 text-amber-400 px-4 py-2 rounded-xl border border-amber-500/20 shadow-inner">
          <Trophy className="w-5 h-5" /> Global Leaderboard
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 glass-card border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)] relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-4 text-3xl shadow-lg border border-white/10">
              {store.username.charAt(0).toUpperCase()}
            </div>
            
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-4 w-full">
                <input 
                  type="text" 
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 bg-black/40 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={20}
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-white font-serif">{store.username}</h2>
                <button onClick={() => setIsEditingName(true)} className="p-1.5 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-md">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xs uppercase text-zinc-500 font-bold mb-1">Rank</div>
                <div className="text-xl font-mono text-amber-400 font-bold">
                  #{players.findIndex(p => p.uid === store.uid) + 1 || '-'}
                </div>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xs uppercase text-zinc-500 font-bold mb-1">XP</div>
                <div className="text-xl font-mono text-emerald-400 font-bold">{store.xp}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboard List */}
        <div className="lg:col-span-2">
          <Card className="p-2 md:p-6 glass-card">
            <div className="flex justify-between items-center mb-6 px-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Top Players</h3>
              <button 
                onClick={fetchLeaderboard} 
                disabled={loading}
                className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                Refresh
              </button>
            </div>
            
            {loading && players.length === 0 ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : players.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-medium">No players found. Sync will happen automatically on Vercel.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {players.map((player, index) => {
                  const isMe = player.uid === store.uid;
                  
                  let RankIcon = null;
                  let rankColor = "text-zinc-500";
                  if (index === 0) { RankIcon = Crown; rankColor = "text-amber-400"; }
                  else if (index === 1) { RankIcon = Medal; rankColor = "text-slate-300"; }
                  else if (index === 2) { RankIcon = Medal; rankColor = "text-amber-700"; }

                  return (
                    <motion.div 
                      key={player.uid}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all",
                        isMe ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)]" : "bg-black/20 border-white/5 hover:bg-black/40"
                      )}
                    >
                      <div className={cn("w-8 text-center font-bold font-mono", rankColor)}>
                        {RankIcon ? <RankIcon className="w-6 h-6 mx-auto" /> : `#${index + 1}`}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-white text-lg flex items-center gap-2">
                          {player.username}
                          {isMe && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400 text-lg">{player.xp || 0}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">XP</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
