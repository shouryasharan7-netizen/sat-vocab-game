import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const { uid } = req.query;
      if (!uid) return res.status(400).json({ error: 'Missing uid' });
      
      const saveData = await kv.get(`save:${uid}`);
      return res.status(200).json({ data: saveData || null });
    }

    if (req.method === 'POST') {
      const { uid, state } = req.body;
      if (!uid || !state) return res.status(400).json({ error: 'Missing required fields' });

      // Save state to KV
      await kv.set(`save:${uid}`, JSON.stringify(state));

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('KV Save Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
