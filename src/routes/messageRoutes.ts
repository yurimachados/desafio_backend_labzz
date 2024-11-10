import express, { Router } from 'express';
import {
  sendMessage,
  getChatMessages,
  deleteMessage,
} from '../controllers/messageController';
import { validateMessage } from '../validation/messageValidation';

const router: Router = express.Router();

router.post('/', validateMessage, sendMessage);
router.get('/:chatId', getChatMessages);
router.delete('/:messageId', deleteMessage);

export default router;
