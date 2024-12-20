import express, { Request, Response, Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { validateUser } from '../middleware/validationMiddleware';

const router: Router = express.Router();

/**
 * @route POST /users
 * @desc Cria um novo usuário
 * @access Público
 */
router.post('/', validateUser, (req: Request, res: Response) => {
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
 * @desc Retorna um usuário pelo ID
 * @access Público
 */
router.get('/:id', (req: Request, res: Response) => {
  getUserById(req, res);
});

/**
 * @route PUT /users/:id
 * @desc Atualiza um usuário pelo ID
 * @access Público
 */
router.put('/:id', validateUser, updateUser);

/**
 * @route DELETE /users/:id
 * @desc Deleta um usuário pelo ID
 * @access Público
 */
router.delete('/:id', deleteUser);

export default router;
