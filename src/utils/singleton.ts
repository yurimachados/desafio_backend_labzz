import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

jest.mock('@prisma/client', () => ({
  __esModule: true,
  PrismaClient: jest.fn(() => prismaMock),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock };
