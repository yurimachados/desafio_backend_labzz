import { Request, Response } from 'express';
import {
  createMessage,
  getMessageById,
  checkIfMessageBelongsToAuthUser,
  deleteMessageFromDatabase,
} from '../services/messageService';

import { getChatById, findCommonChat } from '../services/chatService';
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

    let chat = await findCommonChat(authUserId, userId);

    console.log('chat', chat);
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
    if (!req.authUserId) {
      res.status(400).json({ error: 'User not authenticated' });
      return;
    }

    let chat = await getChatById(Number(req.params.chatId));
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    console.log(chat);
    res.status(200).json({ message: 'Chat messages', data: chat });
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

const validateAuthUser = (req: Request, res: Response): number | null => {
  const authUserId = req.authUserId;
  if (!authUserId) {
    res.status(400).json({ error: 'User not authenticated' });
    return null;
  }
  return authUserId;
};

const validateMessageId = (req: Request, res: Response): number | null => {
  const messageId = Number(req.params.messageId);
  if (!messageId) {
    res.status(400).json({ error: 'Message ID is required' });
    return null;
  }
  return messageId;
};

export const deleteMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authUserId = validateAuthUser(req, res);
    if (!authUserId) return;

    const messageId = validateMessageId(req, res);
    if (!messageId) return;

    const message = await getMessageById(messageId);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    const isOwner = await checkIfMessageBelongsToAuthUser(
      messageId,
      authUserId,
    );
    if (!isOwner) {
      res.status(400).json({ error: 'Message does not belong to auth user' });
      return;
    } else {
      deleteMessageFromDatabase(messageId);
      res.status(200).json({ message: 'Message deleted' });
    }
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
};
