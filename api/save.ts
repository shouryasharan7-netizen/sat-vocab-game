import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const kv = Redis.fromEnv();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { uid } = req.query;
      if (!uid) return res.status(400).json({ error: 'Missing uid' });
      
      const saveData = await kv.get(`save:${uid}`);
      return res.status(200).json({ data: saveData || null });
    }

    if (req.method === 'POST') {
      let body;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
      
      const { uid, state } = body;
      if (!uid || !state) return res.status(400).json({ error: 'Missing required fields' });

      // Save state to KV
      let stateString = '';
      try {
        stateString = typeof state === 'string' ? state : JSON.stringify(state);
      } catch {
        return res.status(400).json({ error: 'Failed to stringify state' });
      }
      
      if (stateString.length > 500000) {
        return res.status(413).json({ error: 'State too large to save' });
      }

      await kv.set(`save:${uid}`, stateString);

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('KV Save Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
