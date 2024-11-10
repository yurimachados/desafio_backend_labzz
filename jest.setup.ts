import { closeRedisConnection } from './src/config/redisConfig';

jest.setTimeout(30000);
afterAll(() => {
  closeRedisConnection();
});
