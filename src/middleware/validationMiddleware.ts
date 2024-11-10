import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

/**
 * Middleware to validate user registration data.
 * Checks if name, email, and password are provided and valid.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Nome é obrigatório e deve ser uma string' });
    return;
  }

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email é obrigatório e deve ser valido' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Email inválido' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res
      .status(400)
      .json({ error: 'Senha é obrigatória e deve ser uma string' });
    return;
  }

  next();
};

/**
 * Middleware to validate login data.
 * Checks if email is valid and password is at least 6 characters long.
 */
export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should be at least 6 characters'),
];

/**
 * Middleware to validate registration data.
 * Checks if name is provided and email is valid.
 */
export const registerValidation = [
  body('username').isString().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should be at least 6 characters'),
];
/**
 * Middleware to check if the user is already in an active session.
 */
export const checkActiveSession = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.cookies && req.cookies.access_token) {
    res.status(400).json({ error: 'You are already in an active session' });
    return;
  }
  next();
};
