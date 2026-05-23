const express = require('express');
const {
  getCompras,
  getCompra,
  createCompra,
  updateCompra,
  deleteCompra
} = require('../controller/compraController');

const router = express.Router();

router.get('/', getCompras);
router.get('/:id_compra', getCompra);
router.post('/', createCompra);
router.put('/:id_compra', updateCompra);
router.delete('/:id_compra', deleteCompra);

module.exports = router;
