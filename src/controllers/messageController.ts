import { Request, Response } from 'express';
import { createMessage, checkChat } from '../services/messageService';
import { validationResult } from 'express-validator';

export const sendMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.authUserId) {
      res.status(400).json({ error: 'User not authenticated' });
      return;
    }
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      let errorMessages = erros.array().map((error) => error.msg);
      res.status(400).json({ errors: errorMessages });
      return;
    }

    const { content, userId } = req.body;
    const authUserId = req.authUserId;

    let chat = await checkChat(authUserId, userId);

    let message;
    if (chat) {
      message = await createMessage({
        content: content,
        authUserId: authUserId,
        chatId: chat.id,
      });
    }

    res.status(201).json({
      message: 'Message created',
      data: message,
    });
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getChatMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let chatId = req.params.chatId;

    res.status(200).json({ message: 'Chat messages', data: { chat: chatId } });
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const createNewChat = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.authUserId) {
      res.status(400).json({ error: 'User not authenticated' });
      return;
    }
    const userId = req.body.userId;
    const authUserId = req.authUserId;

    res
      .status(201)
      .json({ message: 'Chat created', authIser: authUserId, userId: userId });
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    res.status(204).json({ message: 'Message deleted' });
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};
