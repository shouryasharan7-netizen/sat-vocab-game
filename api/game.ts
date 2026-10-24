import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const kv = Redis.fromEnv();

const getDailyKey = () => `leaderboard_daily_${new Date().toISOString().split('T')[0]}`;
const getWeeklyKey = () => `leaderboard_weekly_${Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      let body;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
      
      const { action } = body;

      // Start Game: Generate a session token
      if (action === 'start') {
        const { uid } = body;
        if (!uid) return res.status(400).json({ error: 'Missing uid' });
        
        const sessionId = crypto.randomUUID();
        // Store the session start time with a 1-hour expiry
        await kv.set(`game_session:${sessionId}`, { uid, startTime: Date.now() }, { ex: 3600 });
        
        return res.status(200).json({ sessionId });
      }

      // End Game: Validate session and XP
      if (action === 'end') {
        const { sessionId, uid, username, xpGained, totalXp } = body;
        if (!sessionId || !uid || !username || typeof xpGained !== 'number' || typeof totalXp !== 'number') {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const session = await kv.get(`game_session:${sessionId}`) as { uid: string, startTime: number } | null;
        
        if (!session) {
          return res.status(400).json({ error: 'Invalid or expired session' });
        }

        if (session.uid !== uid) {
          return res.status(403).json({ error: 'Session mismatch' });
        }

        // Validate XP mathematically
        const durationSeconds = (Date.now() - session.startTime) / 1000;
        const maxPossibleXpPerSecond = 10; // Generous ceiling
        const maxPossibleXp = Math.max(20, durationSeconds * maxPossibleXpPerSecond);

        if (xpGained > maxPossibleXp || xpGained < 0) {
          // Cheat detected, invalidate session and reject
          await kv.del(`game_session:${sessionId}`);
          return res.status(403).json({ error: 'Impossible score detected' });
        }

        // Valid! 
        // 1. Invalidate the session
        await kv.del(`game_session:${sessionId}`);
        
        // 2. Update leaderboards
        let safeUsername = String(username).replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 20).trim();
        if (!safeUsername) safeUsername = 'Anonymous';

        const p = kv.pipeline();
        
        p.zadd('leaderboard_xp_v2', { score: totalXp, member: uid });
        
        if (xpGained > 0) {
          const dailyKey = getDailyKey();
          const weeklyKey = getWeeklyKey();
          
          p.zincrby(dailyKey, xpGained, uid);
          p.zincrby(weeklyKey, xpGained, uid);
          
          p.expire(dailyKey, 60 * 60 * 24 * 14);
          p.expire(weeklyKey, 60 * 60 * 24 * 14);
        }
        
        p.hset('user_profiles_v2', { [uid]: safeUsername });
        await p.exec();

        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('KV Game Session Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
