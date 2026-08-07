import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      // Fetch top 50 hardest words
      const topWords = await kv.zrange('hardest_words', 0, 49, { rev: true, withScores: true });
      
      const words = [];
      for (let i = 0; i < topWords.length; i += 2) {
        words.push({ word: topWords[i], fails: topWords[i + 1] });
      }
      
      return res.status(200).json({ words });
    }

    if (req.method === 'POST') {
      const { failedWords } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!Array.isArray(failedWords) || failedWords.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid failedWords' });
      }

      // Increment fail counts for each word
      // We'll use a pipeline for performance
      const p = kv.pipeline();
      failedWords.forEach((word: string) => {
        p.zincrby('hardest_words', 1, word);
      });
      await p.exec();

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('KV Analytics Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
