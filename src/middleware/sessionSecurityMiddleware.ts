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
    res.status(401).json({ message: 'Unauthorized: No access token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      user_id: number;
      cst: string;
      rfs: string;
      exp: number;
    };

    // Validate token structure
    if (!decoded.user_id || !decoded.cst || !decoded.rfs || !decoded.exp) {
      res.status(401).json({ message: 'Invalid token structure' });
      return;
    }

    // Check expiration explicitly
    if (Date.now() >= decoded.exp * 1000) {
      res.status(401).json({ message: 'Access token expired' });
      return;
    }

    // Validate CSRF token from header
    const csrfToken = req.header('x-csrf-token');
    if (!csrfToken) {
      res.status(401).json({ message: 'CSRF token required' });
      return;
    }

    if (csrfToken !== decoded.cst) {
      res.status(401).json({ message: 'Invalid CSRF token' });
      return;
    }

    // Verify session exists in Redis
    const session = await redis.get(`session:${decoded.user_id}`);
    if (!session) {
      res.status(401).json({ message: 'Session expired or invalid' });
      return;
    }

    // Validate session data
    try {
      const sessionData = JSON.parse(session);
      if (!sessionData.csrfToken || !sessionData.refreshToken) {
        res.status(401).json({ message: 'Invalid session data' });
        return;
      }

      // Verify CSRF token matches session
      if (sessionData.csrfToken !== decoded.cst) {
        res.status(401).json({ message: 'Session CSRF token mismatch' });
        return;
      }

      // Verify refresh token matches session
      if (sessionData.refreshToken !== decoded.rfs) {
        res.status(401).json({ message: 'Session refresh token mismatch' });
        return;
      }
    } catch (_parseError) {
      res.status(401).json({ message: 'Corrupted session data' });
      return;
    }

    const userId = getUserIdByToken(token);
    if (!userId) {
      res.status(401).json({ message: 'Invalid user ID in token' });
      return;
    }

    req.authUserId = userId;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token format' });
    } else {
      res.status(401).json({ message: 'Token verification failed' });
    }
  }
};

export { JWT_SECRET };
export default sessionSecurityMiddleware;
