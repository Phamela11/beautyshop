const express = require('express');
const router  = express.Router();
const { getUsuarios, getUsuarioById, updateUsuario, changePassword } = require('../controller/usuarioController');

router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.put('/:id', updateUsuario);
router.post('/:id/change-password', changePassword);

module.exports = router;
