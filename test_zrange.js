import { Redis } from '@upstash/redis';
const kv = Redis.fromEnv();
async function run() {
  await kv.zadd('test_zset', { score: 10, member: 'test1' });
  const result = await kv.zrange('test_zset', 0, -1, { withScores: true });
  console.log(JSON.stringify(result));
}
run();
