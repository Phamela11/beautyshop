const db = require('../db');

// Obtener todas las compras con detalles
const getCompras = async (req, res) => {
  try {
    const [compras] = await db.execute(`
      SELECT c.id_compra, c.id_proveedor, p.nombre as nombre_proveedor,
             c.fecha, c.total,
             COALESCE(
               GROUP_CONCAT(
                 CONCAT(pr.nombre, ' (x', dc.cantidad, ')')
                 ORDER BY pr.nombre
                 SEPARATOR ', '
               ),
               ''
             ) AS productos_compra
      FROM compra c
      LEFT JOIN proveedor p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN detalle_compra dc ON c.id_compra = dc.id_compra
      LEFT JOIN producto pr ON dc.id_producto = pr.id_producto
      GROUP BY c.id_compra, c.id_proveedor, p.nombre, c.fecha, c.total
      ORDER BY c.fecha DESC
    `);
    res.json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una compra con sus detalles
const getCompra = async (req, res) => {
  const { id_compra } = req.params;
  try {
    const [compra] = await db.execute(`
      SELECT c.id_compra, c.id_proveedor, p.nombre as nombre_proveedor, 
             c.fecha, c.total 
      FROM compra c
      LEFT JOIN proveedor p ON c.id_proveedor = p.id_proveedor
      WHERE c.id_compra = ?
    `, [id_compra]);

    if (compra.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    const [detalles] = await db.execute(`
      SELECT dc.id_detalle, dc.id_compra, dc.id_producto, 
             pr.nombre as nombre_producto, dc.cantidad, dc.precio_compra,
             (dc.cantidad * dc.precio_compra) as subtotal
      FROM detalle_compra dc
      LEFT JOIN producto pr ON dc.id_producto = pr.id_producto
      WHERE dc.id_compra = ?
    `, [id_compra]);

    res.json({
      ...compra[0],
      detalles
    });
  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una compra con detalles
const createCompra = async (req, res) => {
  const { id_proveedor, detalles } = req.body;

  if (!id_proveedor || !detalles || detalles.length === 0) {
    return res.status(400).json({ error: 'Proveedor y detalles son obligatorios' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let total = 0;
    for (const detalle of detalles) {
      total += Number(detalle.cantidad) * Number(detalle.precio_compra);
    }

    const [result] = await connection.execute(
      'INSERT INTO compra (id_proveedor, total) VALUES (?, ?)',
      [id_proveedor, total]
    );

    const id_compra = result.insertId;

    for (const detalle of detalles) {
      const [detalleResult] = await connection.execute(
        'INSERT INTO detalle_compra (id_compra, id_producto, cantidad, cantidad_disponible, precio_compra) VALUES (?, ?, ?, ?, ?)',
        [id_compra, detalle.id_producto, detalle.cantidad, detalle.cantidad, detalle.precio_compra]
      );

      try {
        await connection.execute(
          `INSERT INTO movimiento_inventario (id_producto, id_pedido, id_detalle_compra, tipo, cantidad, precio_compra, descripcion)
           VALUES (?, NULL, ?, 'entrada', ?, ?, ?)`,
          [
            detalle.id_producto,
            detalleResult.insertId,
            detalle.cantidad,
            detalle.precio_compra,
            `Compra #${id_compra} - precio compra ${Number(detalle.precio_compra).toFixed(2)}`
          ]
        );
      } catch (movError) {
        if (movError?.code !== 'ER_NO_SUCH_TABLE') {
          throw movError;
        }
      }
    }

    await connection.commit();
    res.status(201).json({
      message: 'Compra creada exitosamente',
      id_compra,
      total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear compra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};

// Actualizar total de una compra (por si se necesita)
const updateCompra = async (req, res) => {
  const { id_compra } = req.params;
  const { id_proveedor } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE compra SET id_proveedor = ? WHERE id_compra = ?',
      [id_proveedor, id_compra]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    res.json({ message: 'Compra actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar compra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar una compra (y sus detalles en cascada)
const deleteCompra = async (req, res) => {
  const { id_compra } = req.params;

  try {
    // Eliminar detalles de compra primero
    await db.execute('DELETE FROM detalle_compra WHERE id_compra = ?', [id_compra]);

    // Eliminar compra
    const [result] = await db.execute('DELETE FROM compra WHERE id_compra = ?', [id_compra]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    res.json({ message: 'Compra eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar compra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getCompras,
  getCompra,
  createCompra,
  updateCompra,
  deleteCompra
};
