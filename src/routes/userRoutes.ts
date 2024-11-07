const express = require('express');
const userController = require('../controllers/userController');
const { validateUser } = require('../middlewares/validationMiddleware');
const router = express.Router();

/**
 * @route POST /users
 * @desc Cria um novo usuário
 * @access Público
 */
router.post('/users', validateUser, userController.createUser);

/**
 * @route GET /users
 * @desc Retorna todos os usuários
 * @access Público
 */
router.get('/users', userController.getAllUsers);

/**
 * @route GET /users/:id
 * @desc Retorna um usuário pelo ID
 * @access Público
 */
router.get('/users/:id', userController.getUserById);

/**
 * @route PUT /users/:id
 * @desc Atualiza um usuário pelo ID
 * @access Público
 */
router.put('/users/:id', validateUser, userController.updateUser);

/**
 * @route DELETE /users/:id
 * @desc Deleta um usuário pelo ID
 * @access Público
 */
router.delete('/users/:id', userController.deleteUser);

module.exports = router;