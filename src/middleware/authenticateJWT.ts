import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import User from '../interfaces/userInterface';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * Middleware para autenticação JWT
 */
const authenticateJWT = (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log('token', token);

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('err', err);
        res.status(403).json({ error: 'Forbidden', message: 'Token inválido' });
        return;
      }

      if (
        typeof decoded === 'object' &&
        'id' in decoded &&
        'username' in decoded &&
        'email' in decoded
      ) {
        req.user = decoded as User;
        return next();
      } else {
        console.log('decoded', decoded);
        return res
          .status(403)
          .json({ error: 'Forbidden', message: 'Invalid token' });
      }
    });
  } else {
    res.sendStatus(401);
  }
};

export { JWT_SECRET };
export default authenticateJWT;
