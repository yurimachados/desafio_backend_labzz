import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createChat = async (authUserId: number, userId: number) => {
  const chat = await prisma.chat.create({
    data: {
      userChats: {
        create: [{ userId: authUserId }, { userId: userId }],
      },
    },
  });
  return chat;
};

export const findCommonChat = async (authUserId: number, userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User do not exist');
  }

  const existingChat = await prisma.userChat.findFirst({
    where: {
      OR: [
        {
          userId: authUserId,
          chat: { userChats: { some: { userId: userId } } },
        },
        {
          userId: userId,
          chat: { userChats: { some: { userId: authUserId } } },
        },
      ],
    },
    include: {
      chat: true,
    },
  });

  if (!existingChat) {
    createChat(authUserId, userId);
  }

  return existingChat?.chat;
};

export const getChatById = async (chatId: number) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });

  if (!chat) {
    console.log('Chat not found');
    return null;
  }

  return chat;
};
