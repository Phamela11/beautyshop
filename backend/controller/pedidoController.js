const db = require('../db');
const { obtenerLotesFIFO, procesarVenta } = require('../services/inventarioFifoService');
const { crearEnvioSiNoExiste } = require('./envioController');

// --- 1. OBTENER TODOS LOS PEDIDOS (ADMIN) ---
const getPedidos = async (req, res) => {
  try {
    const [pedidos] = await db.execute(
      `SELECT p.id_pedido, p.id_usuario, u.nombre AS nombre_usuario, p.fecha, p.total, p.estado,
              e.estado_envio
       FROM pedido p
       LEFT JOIN usuario u ON u.id_usuario = p.id_usuario
       LEFT JOIN envio e ON e.id_pedido = p.id_pedido
       ORDER BY fecha DESC, id_pedido DESC`
    );
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 2. OBTENER PEDIDOS DE UN USUARIO ESPECÍFICO ---
const getPedidosUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const [pedidos] = await db.execute(
      `SELECT p.id_pedido, p.id_usuario, p.fecha, p.total, p.estado,
              e.estado_envio, e.empresa_envio, e.numero_guia, e.ciudad,
              e.direccion_envio
       FROM pedido p
       LEFT JOIN envio e ON e.id_pedido = p.id_pedido
       WHERE p.id_usuario = ?
       ORDER BY p.fecha DESC, p.id_pedido DESC`,
      [id_usuario]
    );
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 3. CREAR PEDIDO MANUAL (ADMIN) ---
const createPedido = async (req, res) => {
  const { id_usuario, detalles } = req.body;

  if (!id_usuario || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Usuario y detalles son obligatorios' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let total = 0;
    for (const detalle of detalles) {
      total += Number(detalle.cantidad) * Number(detalle.precio_unitario);
    }

    const [pedidoResult] = await connection.execute(
      `INSERT INTO pedido (id_usuario, total, estado) VALUES (?, ?, 'pendiente')`,
      [id_usuario, total]
    );
    const id_pedido = pedidoResult.insertId;

    for (const detalle of detalles) {
      await connection.execute(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_pedido, detalle.id_producto, detalle.cantidad, detalle.precio_unitario]
      );
      await procesarVenta(detalle.id_producto, Number(detalle.cantidad), id_pedido, connection);
    }

    await connection.commit();
    res.status(201).json({ message: 'Pedido creado exitosamente', id_pedido, total });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};

// --- 4. CHECKOUT DEL CARRITO (Sincronizado con FIFO) ---
const checkoutCarrito = async (req, res) => {
  const { id_usuario } = req.params;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Buscar carrito activo
    const [carritoRows] = await connection.execute(
      `SELECT id_carrito FROM carrito WHERE id_usuario = ? AND estado = 'activo' LIMIT 1`,
      [id_usuario]
    );

    if (carritoRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No hay carrito activo' });
    }

    const idCarrito = carritoRows[0].id_carrito;

    // Obtener productos con su margen
    const [items] = await connection.execute(
      `SELECT cd.id_producto, cd.cantidad, p.nombre, p.margen_ganancia
       FROM carrito_detalle cd
       INNER JOIN producto p ON p.id_producto = cd.id_producto
       WHERE cd.id_carrito = ?`,
      [idCarrito]
    );

    let totalPedido = 0;
    const detallesPedido = [];

    for (const item of items) {
      const [lotes] = await connection.execute(
        `SELECT precio_compra, cantidad_disponible FROM detalle_compra 
         WHERE id_producto = ? AND cantidad_disponible > 0 
         ORDER BY fecha_ingreso ASC, id_detalle ASC`,
        [item.id_producto]
      );

      const stockDisponible = lotes.reduce((acc, lote) => acc + Number(lote.cantidad_disponible), 0);
      if (stockDisponible < Number(item.cantidad)) {
        throw new Error(`Stock insuficiente para ${item.nombre}`);
      }

      // PRECIO ÚNICO PARA TODO EL PROCESO
      const costoBase = Number(lotes[0].precio_compra);
      const margen = Number(item.margen_ganancia || 0);
      const precioVentaFinal = costoBase * (1 + (margen / 100));

      totalPedido += Number(item.cantidad) * precioVentaFinal;
      detallesPedido.push({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: precioVentaFinal
      });
    }

    const [pedidoResult] = await connection.execute(
      `INSERT INTO pedido (id_usuario, total, estado) VALUES (?, ?, 'pendiente')`,
      [id_usuario, totalPedido]
    );
    const id_pedido = pedidoResult.insertId;

    for (const detalle of detallesPedido) {
      await connection.execute(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_pedido, detalle.id_producto, detalle.cantidad, detalle.precio_unitario]
      );
      await procesarVenta(detalle.id_producto, Number(detalle.cantidad), id_pedido, connection);
    }

    await connection.execute(`UPDATE carrito SET estado = 'procesado' WHERE id_carrito = ?`, [idCarrito]);

    await connection.commit();
    res.status(201).json({ message: 'Pedido generado con éxito', id_pedido, total: totalPedido });

  } catch (error) {
    await connection.rollback();
    console.error('Error al hacer checkout:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// --- 5. ACTUALIZAR ESTADO DEL PEDIDO ---
const updateEstadoPedido = async (req, res) => {
  const { id_pedido } = req.params;
  const { estado } = req.body;
  const estadosPermitidos = ['pendiente', 'enviado'];

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado de pedido inválido' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [pedidoRows] = await connection.execute(
      'SELECT estado FROM pedido WHERE id_pedido = ? FOR UPDATE',
      [id_pedido]
    );

    if (pedidoRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const [envioRows] = await connection.execute(
      'SELECT estado_envio FROM envio WHERE id_pedido = ? FOR UPDATE',
      [id_pedido]
    );

    if (envioRows.some(row => row.estado_envio === 'entregado')) {
      await connection.rollback();
      return res.status(409).json({ error: 'Un pedido entregado no puede volver a pendiente o enviado' });
    }

    await connection.execute(`UPDATE pedido SET estado = ? WHERE id_pedido = ?`, [estado, id_pedido]);
    if (estado === 'enviado') {
      await crearEnvioSiNoExiste(id_pedido, connection);
      // Marcar el envio como en camino al mismo tiempo
      await connection.execute(
        `UPDATE envio SET estado_envio = 'en camino', fecha_envio = COALESCE(fecha_envio, NOW())
         WHERE id_pedido = ?`,
        [id_pedido]
      );
    }
    await connection.commit();
    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Error al actualizar estado' });
  } finally {
    connection.release();
  }
};

// --- 6. SIMULAR VENTA FIFO ---
const simularVenta = async (req, res) => {
  const { id_producto, cantidad } = req.body;
  try {
    const lotes = await obtenerLotesFIFO(id_producto);
    const totalDisponible = lotes.reduce((acc, lote) => acc + Number(lote.cantidad_disponible), 0);
    res.json({
      id_producto,
      cantidad_solicitada: Number(cantidad),
      stock_disponible: totalDisponible,
      suficiente_stock: totalDisponible >= Number(cantidad),
      lotes
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en simulación' });
  }
};

// --- 7. OBTENER DETALLE DEL PEDIDO (VISTA) ---
const getPedidoDetalle = async (req, res) => {
  const { id_pedido } = req.params;
  try {
    const [pedido] = await db.execute(
      `SELECT p.id_pedido, p.id_usuario, u.nombre AS nombre_usuario, u.correo, p.fecha, p.total, p.estado
       FROM pedido p LEFT JOIN usuario u ON u.id_usuario = p.id_usuario
       WHERE p.id_pedido = ?`, [id_pedido]
    );

    if (pedido.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    const [detalles] = await db.execute(
      `SELECT dp.id_producto, pr.nombre AS nombre_producto, dp.cantidad, dp.precio_unitario,
              (dp.cantidad * dp.precio_unitario) AS subtotal
       FROM detalle_pedido dp
       LEFT JOIN producto pr ON pr.id_producto = dp.id_producto
       WHERE dp.id_pedido = ?`, [id_pedido]
    );

    const [envio] = await db.execute(`SELECT * FROM envio WHERE id_pedido = ?`, [id_pedido]);

    res.json({ ...pedido[0], detalles, envio: envio[0] || null });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
};

// --- EXPORTACIÓN FINAL CORREGIDA ---
module.exports = {
  getPedidos,
  getPedidoDetalle,
  getPedidosUsuario,
  createPedido,
  checkoutCarrito,
  updateEstadoPedido,
  simularVenta
};
