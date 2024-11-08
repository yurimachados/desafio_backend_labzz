import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

const csrfProtection = csurf({ cookie: true });

const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
};

export { csrfProtection, setCsrfToken };
