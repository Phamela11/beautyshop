const express = require('express');
const router = express.Router();
const { getResenasPanel, getResenasPorProducto, createResena } = require('../controller/resenaController');

router.get('/usuario/:id_usuario', getResenasPanel);
router.get('/producto/:id_producto', getResenasPorProducto);
router.post('/', createResena);

module.exports = router;
