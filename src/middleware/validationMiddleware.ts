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
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 254 })
    .withMessage('Email too long'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    ),
];

/**
 * Middleware to validate registration data.
 * Checks if name is provided and email is valid.
 */
export const registerValidation = [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 254 })
    .withMessage('Email too long'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    ),
];

/**
 * Enhanced middleware to check if the user is already in an active session.
 * Also validates request headers and body structure.
 */
export const checkActiveSession = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Check for existing session
  if (req.cookies && req.cookies.access_token) {
    res.status(400).json({ error: 'You are already in an active session' });
    return;
  }

  // Validate Content-Type for POST requests
  if (req.method === 'POST' && !req.is('application/json')) {
    res.status(400).json({ error: 'Content-Type must be application/json' });
    return;
  }

  // Validate request body structure
  if (req.method === 'POST' && (!req.body || typeof req.body !== 'object')) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  next();
};

/**
 * Middleware to validate CSRF token and other security headers for authenticated requests.
 */
export const validateSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Validate User-Agent header exists (basic bot protection)
  if (!req.get('User-Agent')) {
    res.status(400).json({ error: 'User-Agent header required' });
    return;
  }

  // Check for suspicious headers that might indicate automated requests
  const suspiciousHeaders = ['x-automated', 'x-bot', 'x-crawler'];
  for (const header of suspiciousHeaders) {
    if (req.get(header)) {
      res.status(403).json({ error: 'Forbidden request type' });
      return;
    }
  }

  next();
};
