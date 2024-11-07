import { Request, Response, NextFunction } from "express";

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Nome é obrigatório e deve ser uma string" });
    return;
  }

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email é obrigatório e deve ser valido" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Email inválido" });
    return;
  }

  if (!password || typeof password !== "string") {
    res
      .status(400)
      .json({ error: "Senha é obrigatória e deve ser uma string" });
    return;
  }

  next();
};
