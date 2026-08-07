import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

// Helper for timeframe keys
const getDailyKey = () => `leaderboard_daily_${new Date().toISOString().split('T')[0]}`;
const getWeeklyKey = () => `leaderboard_weekly_${Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))}`;

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const { timeframe = 'all' } = req.query; // 'all', 'weekly', 'daily'
      
      let key = 'leaderboard_xp_v2';
      if (timeframe === 'weekly') key = getWeeklyKey();
      if (timeframe === 'daily') key = getDailyKey();

      const topScores = await kv.zrange(key, 0, 49, { rev: true, withScores: true });
      
      const players = [];
      for (let i = 0; i < topScores.length; i += 2) {
        const uid = topScores[i] as string;
        const xp = topScores[i + 1] as number;
        const username = await kv.hget('user_profiles_v2', uid) || 'Unknown Scholar';
        players.push({ uid, username, xp });
      }
      
      return res.status(200).json({ players });
    }

    if (req.method === 'POST') {
      const { uid, username, xp, deltaXp } = req.body;
      
      // We need deltaXp to increment the daily/weekly leaderboards accurately.
      // If deltaXp is not provided, we fall back to just setting the all-time.
      
      if (!uid || !username || typeof xp !== 'number') {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let safeUsername = String(username).replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 20).trim();
      if (!safeUsername) safeUsername = 'Anonymous';

      if (xp > 100000 || xp < 0) {
        return res.status(400).json({ error: 'Invalid XP amount' });
      }

      const p = kv.pipeline();
      
      // Update All-Time XP (absolute value)
      p.zadd('leaderboard_xp_v2', { score: xp, member: uid });
      
      // Update Daily/Weekly (incremental value)
      if (typeof deltaXp === 'number' && deltaXp > 0 && deltaXp < 1000) {
        const dailyKey = getDailyKey();
        const weeklyKey = getWeeklyKey();
        
        p.zincrby(dailyKey, deltaXp, uid);
        p.zincrby(weeklyKey, deltaXp, uid);
        
        // Set expiry on these keys so they clean up automatically after 2 weeks
        p.expire(dailyKey, 60 * 60 * 24 * 14);
        p.expire(weeklyKey, 60 * 60 * 24 * 14);
      }
      
      // Update Username in the hash map
      p.hset('user_profiles_v2', { [uid]: safeUsername });

      await p.exec();

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('KV Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
