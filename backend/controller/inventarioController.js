const db = require('../db');

// Obtener todos los lotes de inventario (detalle_compra)
const getLotesInventario = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        dc.id_detalle,
        dc.id_compra,
        dc.id_producto,
        p.nombre as nombre_producto,
        dc.cantidad,
        dc.cantidad_disponible,
        dc.precio_compra,
        dc.fecha_ingreso,
        c.fecha as fecha_compra,
        pr.nombre as nombre_proveedor
      FROM detalle_compra dc
      LEFT JOIN producto p ON dc.id_producto = p.id_producto
      LEFT JOIN compra c ON dc.id_compra = c.id_compra
      LEFT JOIN proveedor pr ON c.id_proveedor = pr.id_proveedor
      WHERE dc.cantidad_disponible > 0
      ORDER BY dc.fecha_ingreso ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener lotes de inventario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener lotes de un producto específico
const getLotesProducto = async (req, res) => {
  const { id_producto } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT
        dc.id_detalle,
        dc.id_compra,
        dc.id_producto,
        p.nombre as nombre_producto,
        dc.cantidad,
        dc.cantidad_disponible,
        dc.precio_compra,
        dc.fecha_ingreso,
        c.fecha as fecha_compra,
        pr.nombre as nombre_proveedor
      FROM detalle_compra dc
      LEFT JOIN producto p ON dc.id_producto = p.id_producto
      LEFT JOIN compra c ON dc.id_compra = c.id_compra
      LEFT JOIN proveedor pr ON c.id_proveedor = pr.id_proveedor
      WHERE dc.id_producto = ? AND dc.cantidad_disponible > 0
      ORDER BY dc.fecha_ingreso ASC
    `, [id_producto]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener lotes del producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener movimientos de inventario con trazabilidad FIFO
const getMovimientosInventario = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        mi.id_movimiento,
        mi.id_producto,
        mi.id_pedido,
        p.nombre as nombre_producto,
        mi.tipo,
        mi.cantidad,
        mi.precio_compra,
        ROUND(mi.precio_compra * (1 + COALESCE(p.margen_ganancia, 0) / 100), 2) AS precio_venta,
        p.margen_ganancia AS margen_ganancia_producto,
        mi.fecha,
        mi.descripcion,
        mi.id_detalle_compra,
        dc.fecha_ingreso AS fecha_lote,
        dc.cantidad as cantidad_lote_original,
        c.fecha as fecha_compra,
        pr.nombre as nombre_proveedor
      FROM movimiento_inventario mi
      LEFT JOIN producto p ON mi.id_producto = p.id_producto
      LEFT JOIN detalle_compra dc ON mi.id_detalle_compra = dc.id_detalle
      LEFT JOIN compra c ON dc.id_compra = c.id_compra
      LEFT JOIN proveedor pr ON c.id_proveedor = pr.id_proveedor
      ORDER BY mi.fecha DESC, mi.id_movimiento DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener movimientos de inventario:', error);
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener movimientos de un producto específico
const getMovimientosProducto = async (req, res) => {
  const { id_producto } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT
        mi.id_movimiento,
        mi.id_producto,
        mi.id_pedido,
        p.nombre as nombre_producto,
        mi.tipo,
        mi.cantidad,
        mi.precio_compra,
        ROUND(mi.precio_compra * (1 + COALESCE(p.margen_ganancia, 0) / 100), 2) AS precio_venta,
        p.margen_ganancia AS margen_ganancia_producto,
        dc.fecha_ingreso AS fecha_lote,
        mi.id_detalle_compra,
        mi.fecha,
        mi.descripcion,
        dc.cantidad as cantidad_lote_original,
        c.fecha as fecha_compra,
        pr.nombre as nombre_proveedor
      FROM movimiento_inventario mi
      LEFT JOIN producto p ON mi.id_producto = p.id_producto
      LEFT JOIN detalle_compra dc ON mi.id_detalle_compra = dc.id_detalle
      LEFT JOIN compra c ON dc.id_compra = c.id_compra
      LEFT JOIN proveedor pr ON c.id_proveedor = pr.id_proveedor
      WHERE mi.id_producto = ?
      ORDER BY mi.fecha DESC, mi.id_movimiento DESC
    `, [id_producto]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener movimientos del producto:', error);
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getLotesInventario,
  getLotesProducto,
  getMovimientosInventario,
  getMovimientosProducto
};