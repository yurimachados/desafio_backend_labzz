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
 * Generates a refresh token.
 */
export const generateRefreshToken = (): string => {
  const refreshTokenPayload = {
    jti: generateRandomToken(),
    sub: 'refresh-token',
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
  const refreshToken = generateRefreshToken();
  const token = generateJwt(userId, csrfToken, refreshToken);

  await redis.set(
    `session:${userId}`,
    JSON.stringify({ csrfToken, refreshToken }),
  );

  return { token, csrfToken };
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
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
  });

  res.setHeader('x-csrf-token', csrfToken);
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

  await redis.del(`session:${userId}`);
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
