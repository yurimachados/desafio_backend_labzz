import request from 'supertest';
import app from '../../app';

describe('Authentication Security Enhancements', () => {
  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple requests to trigger rate limiting
      const promises = Array(6)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/auth/login')
            .send(loginData)
            .set('User-Agent', 'test-agent'),
        );

      const responses = await Promise.all(promises);

      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(
        (res) => res.status === 429,
      );
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);

    it('should enforce rate limiting on refresh token requests', async () => {
      const promises = Array(6)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/auth/refresh')
            .set('User-Agent', 'test-agent'),
        );

      const responses = await Promise.all(promises);

      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(
        (res) => res.status === 429,
      );
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers Validation', () => {
    it('should require User-Agent header for authentication requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User-Agent header required');
    });

    it('should reject requests with suspicious headers', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('User-Agent', 'test-agent')
        .set('x-bot', 'true')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden request type');
    });
  });

  describe('Refresh Token Endpoint', () => {
    it('should reject refresh requests without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Refresh token not found');
    });

    it('should reject invalid refresh tokens', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('User-Agent', 'test-agent')
        .set('Cookie', 'refresh_token=invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired refresh token');
    });
  });

  describe('Enhanced Validation', () => {
    it('should enforce strong password requirements for registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('User-Agent', 'test-agent')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak', // Weak password
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain(
        'Password must be between 8 and 128 characters',
      );
    });

    it('should enforce username format requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('User-Agent', 'test-agent')
        .send({
          username: 'a', // Too short
          email: 'test@example.com',
          password: 'StrongPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain(
        'Username must be between 3 and 50 characters',
      );
    });

    it('should require Content-Type header for POST requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('User-Agent', 'test-agent')
        .set('Content-Type', 'text/plain')
        .send('invalid data');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Content-Type must be application/json');
    });
  });

  describe('CORS Security', () => {
    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/auth/login')
        .set('Origin', 'https://evil-site.com')
        .set('User-Agent', 'test-agent');

      // Note: This test depends on the specific CORS implementation
      // The exact response may vary based on how the server handles CORS errors
      expect([400, 403, 500]).toContain(response.status);
    });
  });
});