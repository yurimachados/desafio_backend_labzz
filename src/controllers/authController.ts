import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import redis from '../config/redisConfig';
import {
  createSession,
  setAuthCookiesAndHeaders,
} from '../services/authService';
import { findUserByEmail, createUser } from '../services/userService';

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  username: string;
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

  const { token, csrfToken } = await createSession(user.id);

  setAuthCookiesAndHeaders(res, token, csrfToken);

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

export const register = async (req: Request, res: Response) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    let errorMessages = erros.array().map((error) => error.msg);
    res.status(400).json({ erros: errorMessages });
    return;
  }

  const { username, email, password } = req.body as RegisterBody;
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await createUser({
    username: username,
    email: email,
    password: hashedPassword,
  });

  const { token, csrfToken } = await createSession(newUser.id);

  setAuthCookiesAndHeaders(res, token, csrfToken);

  res.json({ message: 'Register successful' });
};
