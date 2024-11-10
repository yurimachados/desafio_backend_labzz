import request from 'supertest';
import app from '../../../app';

describe('Testando Helmet', () => {
  it('Deve retornar os cabeçalhos de segurança do Helmet', async () => {
    const response = await request(app).get('/api/user');
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['strict-transport-security']).toBeDefined();
    expect(response.headers['x-download-options']).toBe('noopen');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-permitted-cross-domain-policies']).toBe('none');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(response.headers['x-xss-protection']).toBe('0');
  });
});
