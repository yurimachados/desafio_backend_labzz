import { Request, Response, NextFunction, RequestHandler } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    authUserId?: number;
  }
}
import { getUserIdByToken } from '../services/authService';
import jwt from 'jsonwebtoken';
import redis from '../config/redisConfig';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * Middleware for JWT authentication.
 * Verifies the JWT token, checks for expiration, and validates the session and CSRF token.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
const sessionSecurityMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
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

    const csrfToken = req.header('x-csrf-token');
    if (!csrfToken || csrfToken !== decoded.cst) {
      res.status(401).json({ message: 'Invalid CSRF token' });
      return;
    }

    const session = await redis.get(`session:${decoded.user_id}`);
    if (!session) {
      res.status(401).json({ message: 'Session expired' });
      return;
    }

    const userId = getUserIdByToken(token);

    req.authUserId = userId;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export { JWT_SECRET };
export default sessionSecurityMiddleware;
