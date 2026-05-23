const db = require('../db');
const { crearEnvioSiNoExiste } = require('./envioController');
 
// POST /api/pagos — registrar un pago para un pedido
const registrarPago = async (req, res) => {
  const { id_pedido, metodo_pago, estado_pago = 'completado', fecha_pago } = req.body;
 
  if (!id_pedido || !metodo_pago) {
    return res.status(400).json({ error: 'id_pedido y metodo_pago son obligatorios' });
  }
 
  const metodosValidos = ['tarjeta_credito', 'tarjeta_debito', 'efectivo', 'transferencia'];
  if (!metodosValidos.includes(metodo_pago)) {
    return res.status(400).json({ error: 'Método de pago no válido' });
  }
 
  try {
    // Verificar que el pedido existe
    const [pedidoRows] = await db.execute(
      'SELECT id_pedido FROM pedido WHERE id_pedido = ?',
      [id_pedido]
    );
    if (pedidoRows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
 
    // Verificar que no tenga ya un pago registrado
    const [pagoExistente] = await db.execute(
      'SELECT id_pago FROM pago WHERE id_pedido = ?',
      [id_pedido]
    );
    if (pagoExistente.length > 0) {
      return res.status(409).json({ error: 'Este pedido ya tiene un pago registrado' });
    }
 
    const fechaPago = fecha_pago ? new Date(fecha_pago) : new Date();
 
    const [result] = await db.execute(
      `INSERT INTO pago (id_pedido, metodo_pago, estado_pago, fecha_pago)
       VALUES (?, ?, ?, ?)`,
      [id_pedido, metodo_pago, estado_pago, fechaPago]
    );

    await crearEnvioSiNoExiste(id_pedido);
 
    res.status(201).json({
      message: 'Pago registrado exitosamente',
      id_pago: result.insertId,
      id_pedido,
      metodo_pago,
      estado_pago,
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
 
// GET /api/pagos/pedido/:id_pedido — obtener pago de un pedido
const getPagoPedido = async (req, res) => {
  const { id_pedido } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT id_pago, id_pedido, metodo_pago, estado_pago, fecha_pago
       FROM pago WHERE id_pedido = ?`,
      [id_pedido]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado para este pedido' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
 
module.exports = { registrarPago, getPagoPedido };