import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
