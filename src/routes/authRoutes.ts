import express from 'express';
import sessionSecurityMiddleware from '../middleware/sessionSecurityMiddleware';
import {
  checkActiveSession,
  loginValidation,
  registerValidation,
} from '../middleware/validationMiddleware';
import { login, logout, register } from '../controllers/authController';

const router = express.Router();

/**
 * Rota de Login
 * Recebe credenciais, autentica o usuário e retorna um token JWT
 */
router.post('/login', loginValidation, login);

/**
 * Rota de Logout
 * Opcional: Invalidação de token (pode ser implementado com blacklist)
 */
router.post('/logout', sessionSecurityMiddleware, logout);

/**
 * Rota de Registro
 * Recebe dados do usuário, cria um novo usuário e retorna uma mensagem de sucesso
 */
router.post('/register', checkActiveSession, registerValidation, register);

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
// router.post('/2fa/setup', sessionSecurityMiddleware, (req, res) => {
//   const secret = speakeasy.generateSecret({ length: 20 });
//   // Salvar secret no banco de dados associado ao usuário
//   res.json({ secret: secret.base32 });
// });

// /**
//  * Rota para verificar código 2FA
//  * Valida o código fornecido pelo usuário
//  */
// router.post('/2fa/verify', sessionSecurityMiddleware, (req, res) => {
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
