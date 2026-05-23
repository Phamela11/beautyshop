const express = require('express');
const {
  getPedidos,
  getPedidoDetalle,
  getPedidosUsuario,
  createPedido,
  checkoutCarrito,
  updateEstadoPedido,
  simularVenta
} = require('../controller/pedidoController');

const router = express.Router();

router.get('/', getPedidos);
router.get('/usuario/:id_usuario', getPedidosUsuario);
router.get('/:id_pedido', getPedidoDetalle);
router.post('/', createPedido);
router.post('/checkout/:id_usuario', checkoutCarrito);
router.put('/:id_pedido/estado', updateEstadoPedido);
router.post('/simular-venta', simularVenta);

module.exports = router;
