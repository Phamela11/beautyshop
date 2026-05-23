const express = require('express');
const {
  getLotesInventario,
  getLotesProducto,
  getMovimientosInventario,
  getMovimientosProducto
} = require('../controller/inventarioController');

const router = express.Router();

router.get('/', getLotesInventario);
router.get('/producto/:id_producto', getLotesProducto);
router.get('/movimientos', getMovimientosInventario);
router.get('/movimientos/producto/:id_producto', getMovimientosProducto);

module.exports = router;