import redis from './src/config/redisConfig';

jest.setTimeout(30000);
afterAll(async () => {
  await redis.quit();
});
