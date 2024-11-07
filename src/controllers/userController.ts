import { Request, Response } from "express";
import * as userService from "../services/userService";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    res.status(200).json(user);
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    res.status(200).json(user);
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const response = await userService.deleteUser(Number(req.params.id));
    res.status(204).json(response);
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};
