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

export const login = async (req: Request, res: Response) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    res.status(400).json({ erros: erros.array() });
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
