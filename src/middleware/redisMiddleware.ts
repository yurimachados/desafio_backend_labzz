import { Request, Response, NextFunction } from 'express';
import redis from '../config/redisConfig';

const redisMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.redis = redis;
  next();
};

export default redisMiddleware;
