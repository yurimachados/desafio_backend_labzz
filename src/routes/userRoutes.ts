import express, { Request, Response, Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router: Router = express.Router();

/**
 * @route POST /users
 * @desc Cria um novo usuário
 * @access Privado (Protegido por CSRF)
 */
router.post('/', (req: Request, res: Response) => {
  createUser(req, res);
});

/**
 * @route GET /users
 * @desc Retorna todos os usuários
 * @access Público
 */
router.get('/', (req: Request, res: Response) => {
  getAllUsers(req, res);
});

/**
 * @route GET /users/:id
 * @desc Retorna um usuário por ID
 * @access Público
 */
router.get('/:id', (req: Request, res: Response) => {
  getUserById(req, res);
});

/**
 * @route PUT /users/:id
 * @desc Atualiza um usuário existente
 * @access Privado (Protegido por CSRF)
 */
router.put('/:id', updateUser);

/**
 * @route DELETE deleteUser /:id
 * @desc Deleta um usuário pelo ID
 * @access Público
 */
router.delete('/:id', deleteUser);

export default router;
