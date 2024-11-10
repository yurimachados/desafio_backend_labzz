import { body } from 'express-validator';

export const validateMessage = [
  body('content')
    .notEmpty()
    .withMessage('Content must not be empty text messages')
    .isString()
    .withMessage('Content must be a string'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

export const validateChatCreation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];
