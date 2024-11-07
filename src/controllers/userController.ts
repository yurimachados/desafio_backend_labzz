import { Request, Response } from 'express';
const userService = require('../services/userService');

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userService.getUserById(Number(req.params.id));
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userService.updateUser(Number(req.params.id), req.body);
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const response = await userService.deleteUser(Number(req.params.id));
        res.status(204).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};