import { Request, Response, NextFunction } from 'express';
import redis from '../config/redisConfig';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  message?: string; // Custom error message
}

/**
 * Rate limiting middleware using Redis for distributed rate limiting
 * Implements sliding window algorithm for accurate rate limiting
 */
export const createRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    message = 'Too many requests, please try again later.',
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline();

      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);

      // Count current requests in window
      pipeline.zcard(key);

      // Add current request
      pipeline.zadd(key, now, now);

      // Set expiration
      pipeline.expire(key, Math.ceil(windowMs / 1000));

      const results = await pipeline.exec();

      if (!results) {
        throw new Error('Redis pipeline failed');
      }

      const requestCount = results[1][1] as number;

      if (requestCount >= maxRequests) {
        res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // In case of Redis failure, allow the request to proceed
      // but log the error for monitoring
      next();
    }
  };
};

// Pre-configured rate limiters for different endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (req: Request) =>
    `auth:${req.ip}:${req.body?.email || 'unknown'}`,
  message: 'Too many authentication attempts, please try again later.',
});

export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Rate limit exceeded, please try again later.',
});

export const refreshTokenRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 refresh attempts per minute
  keyGenerator: (req: Request) => `refresh:${req.ip}`,
  message: 'Too many token refresh attempts, please try again later.',
});
