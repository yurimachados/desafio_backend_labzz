import express, { Router } from 'express';
import {
  sendMessage,
  getChatMessages,
  deleteMessage,
} from '../controllers/messageController';
import {
  validateMessage,
  validateChatCreation,
} from '../validation/messageValidation';

const router: Router = express.Router();

router.post('/', validateMessage, sendMessage);

router.get('/:chatId', getChatMessages);

router.delete('/:messageId', validateChatCreation, deleteMessage);

// router.patch('/:chatId/:messageId', createMessage);

// router.delete('/:messageId', createMessage);

export default router;
