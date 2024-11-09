import request from 'supertest';
import app from '../app'; // Caminho para o seu aplicativo Express

describe('Rotas de Usuário com CSRF', () => {
  it('Deve criar um usuário com CSRF válido', async () => {
    const agent = request.agent(app);

    // Primeiro, obtenha o token CSRF
    const resGet = await agent.get('/path-to-get-csrf-token');
    const csrfToken = resGet.body.csrfToken;

    // Em seguida, faça a requisição POST com o token CSRF
    const resPost = await agent
      .post('/user/create')
      .send({
        username: 'novo_usuario',
        password: 'senha_segura',
        _csrf: csrfToken
      });

    expect(resPost.status).toBe(201);
  });

  it('Deve falhar ao criar um usuário sem CSRF Token', async () => {
    const response = await request(app).post('/api/users').send({
      nome: 'Maria Souza',
      email: 'maria.souza@example.com',
      senha: 'senha123',
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'Form tampered with');
  });
});
