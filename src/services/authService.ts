import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from '../config/redisConfig';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

/**
 * Generates a JSON Web Token (JWT) for a given user.
 *
 * @param userId - The unique identifier of the user.
 * @param csrfToken - The CSRF token associated with the user session.
 * @param expiresInMinutes - The time duration in minutes for which the token is valid.
 * @returns The signed JWT as a string.
 */
export const generateJwt = (
  userId: number,
  csrfToken: string,
  refreshToken: string,
  expiresInMinutes: number = 30,
): string => {
  const payload = {
    user_id: userId,
    cst: csrfToken,
    rfs: refreshToken,
    exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60,
  };

  const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

  return token;
};

/**
 * Generates a refresh token with longer expiration.
 */
export const generateRefreshToken = (userId: number): string => {
  const refreshTokenPayload = {
    jti: generateRandomToken(),
    sub: 'refresh-token',
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
    algorithm: 'HS256',
  });

  return refreshToken;
};

/**
 * Generates a CSRF token.
 */
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Creates a session for the user, generating JWT, CSRF token, and refresh token.
 *
 * @param userId - The unique identifier of the user.
 * @returns An object containing the JWT, CSRF token, and refresh token.
 */
export const createSession = async (userId: number) => {
  const csrfToken = generateRandomToken();
  const refreshToken = generateRefreshToken(userId);
  const token = generateJwt(userId, csrfToken, refreshToken);

  // Store session data with refresh token expiration
  await redis.setex(
    `session:${userId}`,
    7 * 24 * 60 * 60, // 7 days
    JSON.stringify({ csrfToken, refreshToken }),
  );

  return { token, csrfToken, refreshToken };
};

/**
 * Sets authentication cookies and headers.
 *
 * @param res - Express response object.
 * @param token - JWT token.
 * @param csrfToken - CSRF token.
 */
export const setAuthCookiesAndHeaders = (
  res: Response,
  token: string,
  csrfToken: string,
) => {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60 * 1000, // 30 minutes
    sameSite: 'strict',
  });

  res.setHeader('x-csrf-token', csrfToken);
};

/**
 * Sets refresh token cookie.
 *
 * @param res - Express response object.
 * @param refreshToken - Refresh token.
 */
export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict',
    path: '/api/auth/refresh', // Restrict to refresh endpoint only
  });
};

export const deleteSession = async (token: string, res: Response) => {
  const decoded = decodeJwt(token);
  if (!decoded) {
    throw new Error('Invalid token');
  }

  const userId = (decoded as jwt.JwtPayload).user_id;
  if (!userId) {
    res.status(400).json({ message: 'userId not found' });
    return;
  }

  // Delete session from Redis
  await redis.del(`session:${userId}`);

  // Clear auth cookies
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
};

/**
 * Refreshes an access token using a valid refresh token.
 *
 * @param refreshToken - The refresh token from cookies.
 * @returns New access token and CSRF token if successful.
 */
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;

    if (decoded.sub !== 'refresh-token') {
      throw new Error('Invalid refresh token type');
    }

    const userId = decoded.user_id;
    if (!userId) {
      throw new Error('User ID not found in refresh token');
    }

    // Verify refresh token against stored session
    const sessionData = await redis.get(`session:${userId}`);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    const { refreshToken: storedRefreshToken } = JSON.parse(sessionData);
    if (refreshToken !== storedRefreshToken) {
      throw new Error('Refresh token mismatch');
    }

    // Generate new CSRF token but keep the same refresh token
    const csrfToken = generateRandomToken();
    const newAccessToken = generateJwt(userId, csrfToken, refreshToken);

    // Update session with new CSRF token
    await redis.setex(
      `session:${userId}`,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({ csrfToken, refreshToken: storedRefreshToken }),
    );

    return { token: newAccessToken, csrfToken };
  } catch (_error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Revokes a refresh token by deleting the session.
 *
 * @param refreshToken - The refresh token to revoke.
 */
export const revokeRefreshToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;
    const userId = decoded.user_id;

    if (userId) {
      await redis.del(`session:${userId}`);
    }
  } catch (_error) {
    // Token is already invalid, nothing to revoke
    console.log('Attempted to revoke invalid refresh token');
  }
};

export const getUserIdByToken = (token: string) => {
  const decoded = decodeJwt(token);
  if (!decoded) {
    return null;
  }

  return (decoded as jwt.JwtPayload).user_id;
};

const decodeJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
};
