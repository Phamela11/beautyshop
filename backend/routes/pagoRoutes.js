const express = require('express');
const { registrarPago, getPagoPedido } = require('../controller/pagoController');
 
const router = express.Router();
 
router.post('/', registrarPago);
router.get('/pedido/:id_pedido', getPagoPedido);
 
module.exports = router;
 