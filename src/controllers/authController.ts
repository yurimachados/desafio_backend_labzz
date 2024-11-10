import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import redis from '../config/redisConfig';
import {
  generateJwt,
  generateRandomToken,
  generateRefreshToken,
} from '../services/authService';
import { findUserByEmail } from '../services/userService';

interface LoginBody {
  email: string;
  password: string;
}

/**
 * Handles user login.
 * Validates the request body, checks user credentials, generates JWT, CSRF token, and refresh token.
 * Sets the access token as a cookie and returns a success message.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const login = async (req: Request, res: Response) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    let errorMessages = erros.array().map((error) => error.msg);
    res.status(400).json({ erros: errorMessages });
    return;
  }

  const { email, password } = req.body as LoginBody;
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ mensagem: 'Invalid credentials' });
    return;
  }

  const csrfToken = generateRandomToken();
  const refreshToken = generateRefreshToken();
  const token = generateJwt(user.id, csrfToken, refreshToken);

  redis.set(`session:${user.id}`, JSON.stringify({ csrfToken, refreshToken }));

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
  });

  res.setHeader('x-csrf-token', csrfToken);

  res.json({ message: 'Login successful' });
};

/**
 * Handles user logout.
 * Deletes the session from Redis and clears the access token cookie.
 * Returns a success message if the access token is found, otherwise returns an error message.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const logout = async (req: Request, res: Response) => {
  const accessToken = req.cookies['access_token'];

  if (accessToken) {
    await redis.del(`session:${accessToken}`);
    res.clearCookie('access_token');
    res.json({ message: 'Logout successful' });
  } else {
    res.status(400).json({ message: 'Access token not found' });
  }
};
