import express, { Request, Response } from 'express';
import authenticateJWT from '../middleware/authenticateJWT';
import { body, validationResult } from 'express-validator';
import prisma from '../prismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

interface LoginBody {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

/**
 * Rota de Login
 * Recebe credenciais, autentica o usuário e retorna um token JWT
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    console.log('Corpo da requisição', req.body);

    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ erros: erros.array() });
      return;
    }

    const { email, password } = req.body as LoginBody;

    if (!password) {
      res.status(400).json({ mensagem: 'Senha é obrigatória' });
      return;
    }

    try {
      const usuario = await prisma.user.findUnique({
        where: { email },
      });

      if (!usuario) {
        res.status(401).json({ mensagem: 'Credenciais inválidas' });
        return;
      }

      // Comparar senhas
      const senhaCorreta = await bcrypt.compare(password, usuario.password);
      if (!senhaCorreta) {
        res.status(401).json({ mensagem: 'Credenciais inválidas' });
        return;
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, username: usuario.username, email: usuario.email },
        JWT_SECRET,
        {
          expiresIn: '1h',
        },
      );

      res.json({ token });
      return;
    } catch (error) {
      console.error(error);

      if (!res.headersSent) {
        res.status(500).json({ mensagem: 'Erro ao realizar login' });
      }
    }

    return;
  },
);

/**
 * Rota de Logout
 * Opcional: Invalidação de token (pode ser implementado com blacklist)
 */
router.post('/logout', authenticateJWT, (req, res) => {
  // Implementar lógica de logout
  res.json({ message: 'Logout realizado com sucesso' });
});

/**
 * Rota para iniciar fluxo OAuth2
 */
// router.get('/oauth2', passport.authenticate('oauth2'));

/**
 * Rota de Callback OAuth2
 * Após autenticação com o provedor, gera e retorna JWT
 */
// router.get(
//   '/oauth2/callback',
//   passport.authenticate('oauth2', { failureRedirect: '/login' }),
//   (req, res) => {
//     // Gerar token JWT para o usuário autenticado
//     const token = jwt.sign({ id: req.user.id }, JWT_SECRET, {
//       expiresIn: '1h',
//     });
//     res.json({ token });
//   },
// );

// /**
//  * Rota para configurar 2FA
//  * Gera e retorna o segredo para o usuário configurar seu app de autenticação
//  */
// router.post('/2fa/setup', authenticateJWT, (req, res) => {
//   const secret = speakeasy.generateSecret({ length: 20 });
//   // Salvar secret no banco de dados associado ao usuário
//   res.json({ secret: secret.base32 });
// });

// /**
//  * Rota para verificar código 2FA
//  * Valida o código fornecido pelo usuário
//  */
// router.post('/2fa/verify', authenticateJWT, (req, res) => {
//   const { token, secret } = req.body;

//   const verified = speakeasy.totp.verify({
//     secret: secret,
//     encoding: 'base32',
//     token: token,
//   });

//   if (verified) {
//     res.json({ verified: true });
//   } else {
//     res.status(400).json({ verified: false });
//   }
// });

export default router;
