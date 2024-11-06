import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface CreateUserInput {
    email: string;
    username: string;
    password: string;
}

interface UpdateUserInput {
    email?: string;
    username?: string;
}

/**
 * Cria um novo usuário com os dados fornecidos.
 * @param data - Dados para criar um novo usuário.
 * @returns O usuário criado.
 */
export const createUser = async (data: CreateUserInput): Promise<User> => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
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
    return await prisma.user.findMany();
};

/**
 * Retorna um usuário pelo ID.
 * @param id - ID do usuário.
 * @returns O usuário correspondente ao ID ou null se não encontrado.
 */
export const getUserById = async (id: number): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Atualiza um usuário pelo ID.
 * @param id - ID do usuário.
 * @param data - Dados para atualizar o usuário.
 * @returns O usuário atualizado.
 */
export const updateUser = async (id: number, data: UpdateUserInput): Promise<User> => {
    return await prisma.user.update({
        where: {
            id: Number(id), 
        },
        data,
    });
};

/**
 * Deleta um usuário pelo ID.
 * @param id - ID do usuário.
 * @returns O usuário deletado.
 */
export const deleteUser = async (id: number): Promise<{ message: string}> => {
    if (isNaN(id)) {
        throw new Error("ID inválido");
    }
    
    const user = await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
    });
    
    if (!user) {
        throw new Error("Usuário não encontrado");
    }
    
    await prisma.user.delete({
        where: {
            id: Number(id),
        },
    });
    
    return { message: "Usuário deletado com sucesso!" };
};