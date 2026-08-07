import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'POST') {
      const { action } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (action === 'generate') {
        const { uid } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!uid) return res.status(400).json({ error: 'Missing uid' });
        
        // Generate a 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store in KV with a 5 minute expiration
        await kv.set(`sync:${code}`, uid, { ex: 300 });
        
        return res.status(200).json({ code });
      }

      if (action === 'consume') {
        const { code } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!code) return res.status(400).json({ error: 'Missing code' });

        const targetUid = await kv.get(`sync:${code}`);
        if (!targetUid) {
          return res.status(404).json({ error: 'Invalid or expired code' });
        }

        // We do not delete the code immediately to allow multiple devices to sync? 
        // Better to delete it for security.
        await kv.del(`sync:${code}`);

        return res.status(200).json({ targetUid });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('KV Sync Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
