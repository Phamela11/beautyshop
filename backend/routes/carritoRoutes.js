const express = require('express');
const {
  getCarritoUsuario,
  addProductoCarrito,
  updateCantidadCarrito
} = require('../controller/carritoController');

const router = express.Router();

router.get('/:id_usuario', getCarritoUsuario);
router.post('/:id_usuario/items', addProductoCarrito);
router.put('/:id_usuario/items/:id_producto', updateCantidadCarrito);

module.exports = router;
