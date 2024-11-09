import { closeRedisConnection } from './src/config/redisConfig';

afterAll(() => {
  closeRedisConnection();
});
