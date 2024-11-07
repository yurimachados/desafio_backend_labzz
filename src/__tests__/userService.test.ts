// userService.test.ts
import { prismaMock } from '../utils/singleton';
import { createUser } from '../services/userService';
import bcrypt from 'bcrypt';

jest.mock('../prismaClient', () => ({
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

    // Outros testes...
});