import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeAll(() => {
    app.locals.users = [{ username: 'testuser', password: 'testpassword' }];
  });

  describe('POST /auth/login', () => {
    it('should authenticate user and return a access_token cookie and x-csrf-token header with csrf token', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpassword' });

      expect(response.status).toBe(200);
      expect(response.headers['access_token']).toBeDefined();
      expect(response.headers['x-csrf-token']).toBeDefined();
    });

    it('should return 400 for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'invaliduser', password: 'invalidpassword' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user and return 200', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(200);
    });

    it('should return 401 for missing or invalid token', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});
