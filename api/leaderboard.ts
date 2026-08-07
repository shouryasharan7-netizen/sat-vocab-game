import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      // Fetch top 50 players sorted by XP descending
      // We use zrange with 'REV' and 'WITHSCORES'
      const topScores = await kv.zrange('leaderboard_xp_v2', 0, 49, { rev: true, withScores: true });
      
      // topScores returns e.g. [ 'uid1', 500, 'uid2', 300 ]
      // We also need to fetch their usernames. 
      // We store usernames in a hash `user_profiles` mapping uid -> username
      
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
      const { uid, username, xp } = req.body;
      if (!uid || !username || typeof xp !== 'number') {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let safeUsername = String(username).replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 20).trim();
      if (!safeUsername) safeUsername = 'Anonymous';

      if (xp > 50000 || xp < 0) {
        return res.status(400).json({ error: 'Invalid XP amount' });
      }

      // Update XP in the sorted set
      await kv.zadd('leaderboard_xp_v2', { score: xp, member: uid });
      
      // Update Username in the hash map
      await kv.hset('user_profiles_v2', { [uid]: safeUsername });

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('KV Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
