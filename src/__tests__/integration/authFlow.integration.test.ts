import request from 'supertest';
import app from '../../app';
import { faker } from '@faker-js/faker';
import { findUserByEmail, deleteUser } from '../../services/userService';

describe('Auth Flow Integration Tests', () => {
  const testUser = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.internet.username(),
  };

  let csrfToken: string;
  let accessTokenCookie: string;

  afterAll(async () => {
    findUserByEmail(testUser.email).then(async (user) => {
      if (user) {
        await deleteUser(user.id);
      }
    });
  });

  describe('POST /register', () => {
    it('should register the faker user on database', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.message).toBe('Register successful');
      expect(response.headers).toHaveProperty('x-csrf-token');
      expect(response.headers).toHaveProperty('set-cookie');

      csrfToken = response.headers['x-csrf-token'];
      const cookies = response.headers['set-cookie'] as unknown as string[];
      accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('access_token'),
      ) as string;
    });

    it('should return 400 when trying to register with an already used email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.message).toBe('Email already in use');
    });

    it('should return 400 when trying to register with invalid email, username and password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: null,
          password: faker.string.alphanumeric(5),
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Invalid email',
          'Username is required',
          'Password should be at least 6 characters',
        ]),
      );
    });

    it('should return 400 when trying to register with an active session', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Cookie', accessTokenCookie)
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
          username: faker.internet.username(),
        })
        .expect(400);

      expect(response.body.error).toBe('You are already in an active session');
    });
  });

  describe('POST /login', () => {
    it('should login user and return JWT token', async () => {
      let loginPayload = {
        email: testUser.email,
        password: testUser.password,
      };
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.headers).toHaveProperty('set-cookie');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: faker.string.alphanumeric(5),
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Invalid email',
          'Password should be at least 6 characters',
        ]),
      );
    });

    it('should return 400 if user is already in an active session', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Cookie', accessTokenCookie)
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
        .expect(400);

      expect(response.body.error).toBe('You are already in an active session');
    });
  });

  describe('POST /logout', () => {
    it('should logout user and invalidate session', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', accessTokenCookie)
        .set('x-csrf-token', csrfToken)
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          ),
        ]),
      );
    });

    it('should return 400 if access token is not found', async () => {
      const response = await request(app).post('/api/auth/logout').expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 400 if CSRF token is not found', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', accessTokenCookie)
        .expect(401);

      expect(response.body.message).toBe('Invalid CSRF token');
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app).post('/api/auth/logout').expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('CORS', () => {
    it('should have CORS headers for allowed origins', async () => {
      const response = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://localhost:3000')
        .expect(204);

      expect(response.headers).toHaveProperty(
        'access-control-allow-origin',
        'http://localhost:3000',
      );
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty(
        'access-control-allow-credentials',
        'true',
      );
    });

    it('should not allow CORS for disallowed origins', async () => {
      const response = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://disallowed-origin.com')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
