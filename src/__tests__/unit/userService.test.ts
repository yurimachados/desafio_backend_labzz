import { prismaMock } from '../../utils/__mocks__/singleton';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../../services/userService';
import bcrypt from 'bcryptjs';

jest.mock('../../prismaClient', () => ({
  __esModule: true,
  default: prismaMock,
}));

describe('User Service', () => {
  it('deve criar um novo usuário', async () => {
    const inputData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    const hashedPassword = await bcrypt.hash(inputData.password, 10);

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      ...inputData,
      password: hashedPassword,
    });

    const user = await createUser(inputData);

    expect(user).toHaveProperty('id', 1);
    expect(user.email).toBe(inputData.email);
    expect(user.username).toBe(inputData.username);
    expect(await bcrypt.compare(inputData.password, user.password)).toBe(true);
  });

  it('deve lançar um erro se o email já estiver em uso', async () => {
    const inputData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: inputData.email,
      username: inputData.username,
      password: 'hashedpassword',
    });

    await expect(createUser(inputData)).rejects.toThrow('Email já está em uso');
  });

  it('deve lançar um erro se a criação do usuário falhar', async () => {
    const inputData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue(
      new Error('Falha na criação do usuário'),
    );

    await expect(createUser(inputData)).rejects.toThrow(
      'Falha na criação do usuário',
    );
  });

  it('deve criar um usuário com senha criptografada', async () => {
    const inputData = {
      email: 'test2@example.com',
      username: 'testuser2',
      password: 'password123',
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 2,
      ...inputData,
      password: await bcrypt.hash(inputData.password, 10),
    });

    const user = await createUser(inputData);

    expect(await bcrypt.compare(inputData.password, user.password)).toBe(true);
  });

  it('deve retornar todos os usuários', async () => {
    const users = [
      {
        id: 1,
        email: 'user1@example.com',
        username: 'user1',
        password: 'hashedpassword1',
      },
      {
        id: 2,
        email: 'user2@example.com',
        username: 'user2',
        password: 'hashedpassword2',
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(users);

    const result = await getAllUsers();

    expect(result).toEqual(users);
  });

  it('deve retornar uma lista vazia se não houver usuários', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    const result = await getAllUsers();

    expect(result).toEqual([]);
  });

  it('deve lançar um erro se a busca por usuários falhar', async () => {
    prismaMock.user.findMany.mockRejectedValue(
      new Error('Falha na busca por usuários'),
    );

    await expect(getAllUsers()).rejects.toThrow('Falha na busca por usuários');
  });

  it('deve retornar um usuário pelo ID', async () => {
    const user = {
      id: 1,
      email: 'user1@example.com',
      username: 'user1',
      password: 'hashedpassword1',
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await getUserById(1);

    expect(result).toEqual(user);
  });

  it('deve retornar null se o usuário não for encontrado', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await getUserById(999);

    expect(result).toBeNull();
  });

  it('deve lançar um erro se a busca pelo usuário falhar', async () => {
    prismaMock.user.findUnique.mockRejectedValue(
      new Error('Falha na busca pelo usuário'),
    );

    await expect(getUserById(1)).rejects.toThrow('Falha na busca pelo usuário');
  });

  it('deve atualizar um usuário existente', async () => {
    const userId = 1;
    const updateData = {
      email: 'updated@example.com',
      username: 'updateduser',
    };
    const existingUser = {
      id: userId,
      email: 'user1@example.com',
      username: 'user1',
      password: 'hashedpassword1',
    };
    const updatedUser = { ...existingUser, ...updateData };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await updateUser(userId, updateData);

    expect(result).toEqual(updatedUser);
  });

  it('deve lançar um erro se o usuário não for encontrado', async () => {
    const userId = 999;
    const updateData = {
      email: 'updated@example.com',
      username: 'updateduser',
    };

    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(updateUser(userId, updateData)).rejects.toThrow(
      'Usuário não encontrado',
    );
  });

  it('deve lançar um erro se a atualização do usuário falhar', async () => {
    const userId = 1;
    const updateData = {
      email: 'updated@example.com',
      username: 'updateduser',
    };
    const existingUser = {
      id: userId,
      email: 'user1@example.com',
      username: 'user1',
      password: 'hashedpassword1',
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);
    prismaMock.user.update.mockRejectedValue(
      new Error('Falha na atualização do usuário'),
    );

    await expect(updateUser(userId, updateData)).rejects.toThrow(
      'Falha na atualização do usuário',
    );
  });

  it('deve deletar um usuário existente', async () => {
    const userId = 1;
    const existingUser = {
      id: userId,
      email: 'user1@example.com',
      username: 'user1',
      password: 'hashedpassword1',
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);
    prismaMock.user.delete.mockResolvedValue(existingUser);

    const result = await deleteUser(userId);

    expect(result).toEqual({ message: 'Usuário deletado com sucesso!' });
  });

  it('deve lançar um erro se o usuário não for encontrado', async () => {
    const userId = 999;

    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(deleteUser(userId)).rejects.toThrow('Usuário não encontrado');
  });

  it('deve lançar um erro se a deleção do usuário falhar', async () => {
    const userId = 1;
    const existingUser = {
      id: userId,
      email: 'user1@example.com',
      username: 'user1',
      password: 'hashedpassword1',
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);
    prismaMock.user.delete.mockRejectedValue(
      new Error('Falha na deleção do usuário'),
    );

    await expect(deleteUser(userId)).rejects.toThrow(
      'Falha na deleção do usuário',
    );
  });
});
