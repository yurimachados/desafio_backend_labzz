import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import {
  createSession,
  setAuthCookiesAndHeaders,
  deleteSession,
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
    res.status(400).json({ errors: errorMessages });
    return;
  }

  const { email, password } = req.body as LoginBody;
  const user = await findUserByEmail(email);
  if (!user) {
    console.log('User not found');
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid credentials' });
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

  deleteSession(accessToken, res);
  res.clearCookie('access_token');
  res.json({ message: 'Logout successful' });
};

export const register = async (req: Request, res: Response) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    let errorMessages = erros.array().map((error) => error.msg);
    res.status(400).json({ errors: errorMessages });
    return;
  }

  const { username, email, password } = req.body as RegisterBody;
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ message: 'Email already in use' });
    return;
  }

  const newUser = await createUser({
    username: username,
    email: email,
    password: password,
  });

  const { token, csrfToken } = await createSession(newUser.id);

  setAuthCookiesAndHeaders(res, token, csrfToken);

  res.status(201).json({ message: 'Register successful' });
};
