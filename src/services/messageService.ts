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
  await prisma.message.create({
    data: {
      content: content,
      userId: authUserId,
      chatId: chatId,
      type: 'TEXT',
    },
  });
};

export const checkChat = async (authUserId: number, userId: number) => {
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
  });

  if (!existingChat) {
    createChat(authUserId, userId);
  }

  return existingChat;
};

const createChat = async (authUserId: number, userId: number) => {
  const chat = await prisma.chat.create({
    data: {
      userChats: {
        create: [{ userId: authUserId }, { userId: userId }],
      },
    },
  });

  return chat;
};
