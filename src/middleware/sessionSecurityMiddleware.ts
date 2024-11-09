import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import redis from '../config/redisConfig';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * Middleware para autenticação JWT
 */
const sessionSecurityMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ message: 'Access token missing' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      user_id: string;
      cst: string;
      exp: number;
    };

    if (Date.now() >= decoded.exp * 1000) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }

    const session = await redis.get(`session:${decoded.user_id}`);
    if (!session) {
      res.status(401).json({ message: 'Session expired' });
      return;
    }

    redis.get(`session:${decoded.user_id}`, (err, session) => {
      if (err || !session)
        return res.status(401).json({ message: 'Session expired' });

      const csrfToken = req.header('x-csrf-token');
      if (!csrfToken || csrfToken !== decoded.cst) {
        res.status(403).json({ message: 'Invalid CSRF token' });
        return;
      }

      next();
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export { JWT_SECRET };
export default sessionSecurityMiddleware;
