import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMessage = async ({
  content,
  authUserId,
  chatId,
}: {
  content: string;
  authUserId: number;
  chatId: number;
}) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    throw new Error('Chat does not exist');
  }

  await prisma.message.create({
    data: {
      content: content,
      userId: authUserId,
      chatId: chatId,
      type: 'TEXT',
    },
  });
};

export const getMessageById = async (messageId: number) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    console.log('Message not found');
    return null;
  }

  return message;
};

export const checkIfMessageBelongsToAuthUser = async (
  messageId: number,
  authUserId: number,
) => {
  const message = await getMessageById(messageId);

  if (!message) {
    return false;
  }

  return message.userId === authUserId;
};

export const deleteMessageFromDatabase = async (messageId: number) => {
  await prisma.message.delete({
    where: { id: messageId },
  });
};
