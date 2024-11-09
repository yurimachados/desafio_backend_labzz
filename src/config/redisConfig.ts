import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  connectTimeout: 10000,
});

redis
  .ping()
  .then((result) => {
    console.log('Resposta do Redis:', result);
  })
  .catch((err) => {
    console.log('Erro ao conectar no Redis:', err);
  });

export default redis;
