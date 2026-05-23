const db = require('../db');

const obtenerLotesFIFO = async (productoId, connection = db) => {
  const [lotes] = await connection.execute(
    `SELECT id_detalle, id_producto, cantidad_disponible, precio_compra, fecha_ingreso
     FROM detalle_compra
     WHERE id_producto = ? AND cantidad_disponible > 0
     ORDER BY fecha_ingreso ASC, id_detalle ASC`,
    [productoId]
  );

  return lotes;
};

const calcularPlanDescuento = (lotes, cantidadSolicitada) => {
  let restante = Number(cantidadSolicitada);
  const plan = [];

  for (const lote of lotes) {
    if (restante <= 0) break;

    const disponible = Number(lote.cantidad_disponible);
    const aDescontar = Math.min(disponible, restante);
    if (aDescontar <= 0) continue;

    plan.push({
      id_detalle: lote.id_detalle,
      cantidad: aDescontar,
      precio_compra: lote.precio_compra,
      fecha_ingreso: lote.fecha_ingreso
    });
    restante -= aDescontar;
  }

  return {
    plan,
    restante
  };
};

// Procesar venta con trazabilidad FIFO completa
const procesarVenta = async (productoId, cantidad, pedidoId, connection = db) => {
  const lotes = await obtenerLotesFIFO(productoId, connection);
  const { plan, restante } = calcularPlanDescuento(lotes, cantidad);

  if (restante > 0) {
    throw new Error(`Stock insuficiente para el producto ${productoId}. Faltan ${restante} unidades.`);
  }

  const consumidos = [];
  for (const descuento of plan) {
    // Actualizar cantidad_disponible del lote
    await connection.execute(
      `UPDATE detalle_compra
       SET cantidad_disponible = cantidad_disponible - ?
       WHERE id_detalle = ?`,
      [descuento.cantidad, descuento.id_detalle]
    );

    // Registrar movimiento con trazabilidad completa
    await connection.execute(
      `INSERT INTO movimiento_inventario (id_producto, id_pedido, id_detalle_compra, tipo, cantidad, precio_compra, descripcion)
       VALUES (?, ?, ?, 'salida', ?, ?, ?)`,
      [
        productoId,
        pedidoId,
        descuento.id_detalle,
        descuento.cantidad,
        descuento.precio_compra,
        `Venta pedido #${pedidoId} - Lote FIFO (ingreso ${descuento.fecha_ingreso})`
      ]
    );

    consumidos.push({
      id_detalle: descuento.id_detalle,
      cantidad: descuento.cantidad,
      precio_compra: descuento.precio_compra,
      fecha_lote: descuento.fecha_ingreso
    });
  }

  return consumidos;
};

module.exports = {
  obtenerLotesFIFO,
  procesarVenta
};
