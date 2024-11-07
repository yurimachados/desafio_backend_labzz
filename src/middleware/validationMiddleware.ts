import { Request, Response, NextFunction } from 'express';

export const validateUser = (req: Request, res: Response, next: NextFunction): Response | void => {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Nome é obrigatório e deve ser uma string' });
    }

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email é obrigatório e deve ser valido' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
    }

    if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Senha é obrigatória e deve ser uma string' });
    }

    next();
};
