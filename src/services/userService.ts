import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  CreateUserInput,
  UpdateUserInput,
} from '../interfaces/inputInterfaces';

const prisma = new PrismaClient();

/**
 * Cria um novo usuário com os dados fornecidos.
 * @param data - Dados para criar um novo usuário.
 * @returns O usuário criado.
 */
export const createUser = async (data: CreateUserInput): Promise<User> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error('Email já está em uso');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
    },
  });
};

/**
 * Retorna todos os usuários.
 * @returns Uma lista de usuários.
 */
export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

/**
 * Retorna um usuário pelo ID.
 * @param id - ID do usuário.
 * @returns O usuário correspondente ao ID ou null se não encontrado.
 */
export const getUserById = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

/**
 * Atualiza um usuário pelo ID.
 * @param id - ID do usuário.
 * @param data - Dados para atualizar o usuário.
 * @returns O usuário atualizado.
 */
export const updateUser = async (
  id: number,
  data: UpdateUserInput,
): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const updatedData = prisma.user.update({
    where: {
      id,
    },
    data,
  });

  return updatedData;
};

/**
 * Deleta um usuário pelo ID.
 * @param id - ID do usuário.
 * @returns Mensagem de sucesso ou erro.
 */
export const deleteUser = async (id: number): Promise<{ message: string }> => {
  if (isNaN(id)) {
    throw new Error('ID inválido');
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  await prisma.user.delete({
    where: {
      id,
    },
  });

  return { message: 'Usuário deletado com sucesso!' };
};

export const findUserByEmail = async (email: string) => {
  const user = prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  return user;
};
