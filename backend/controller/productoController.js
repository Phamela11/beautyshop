const db = require('../db');
const fs = require('fs').promises;
const path = require('path');

const getProductos = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.margen_ganancia,
        p.id_categoria,
        p.estado,
        c.nombre as nombre_categoria,
        COALESCE(dc.stock, 0) as stock,
        pi.imagenes
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN (
        SELECT id_producto, SUM(cantidad_disponible) AS stock
        FROM detalle_compra
        GROUP BY id_producto
      ) dc ON p.id_producto = dc.id_producto
      LEFT JOIN (
        SELECT id_producto, GROUP_CONCAT(url_imagen) AS imagenes
        FROM producto_imagen
        GROUP BY id_producto
      ) pi ON p.id_producto = pi.id_producto
      WHERE p.estado = 'activo'
    `);

    const productos = [];
    for (const producto of rows) {
      let precioPromedio = 0;
      let ultimoCosto = null;
      const totalDisponible = producto.stock;

      if (totalDisponible > 0) {
        const [lotes] = await db.execute(`
          SELECT precio_compra, cantidad_disponible
          FROM detalle_compra
          WHERE id_producto = ? AND cantidad_disponible > 0
          ORDER BY fecha_ingreso ASC
        `, [producto.id_producto]);

        let sumaPrecios = 0;
        for (const lote of lotes) {
          sumaPrecios += lote.precio_compra * lote.cantidad_disponible;
        }
        precioPromedio = sumaPrecios / totalDisponible;
        ultimoCosto = lotes.length > 0 ? lotes[lotes.length - 1].precio_compra : null;
      }

      const precioVenta = precioPromedio * (1 + producto.margen_ganancia / 100);

      productos.push({
        ...producto,
        costo_promedio: totalDisponible > 0 ? precioPromedio : null,
        ultimo_costo: ultimoCosto,
        precio: precioVenta,
        imagenes: producto.imagenes ? producto.imagenes.split(',') : []
      });
    }

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createProducto = async (req, res) => {
  const { nombre, descripcion, margen_ganancia, id_categoria } = req.body;
  const imagenes = req.files;

  if (!nombre || !nombre.toString().trim()) {
    return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
  }

  if (!id_categoria) {
    return res.status(400).json({ error: 'La categoría es obligatoria' });
  }

  const categoriaId = Number(id_categoria);
  if (Number.isNaN(categoriaId)) {
    return res.status(400).json({ error: 'Categoría inválida' });
  }

  const margenGanancia = Number(String(margen_ganancia || '0').replace(',', '.'));
  if (Number.isNaN(margenGanancia)) {
    return res.status(400).json({ error: 'Margen de ganancia inválido' });
  }

  if (!imagenes || imagenes.length < 5) {
    return res.status(400).json({ error: 'Debes subir 5 imágenes para el producto' });
  }

  try {
    const [categoriaRows] = await db.execute(
      'SELECT id_categoria FROM categoria WHERE id_categoria = ?',
      [categoriaId]
    );

    if (categoriaRows.length === 0) {
      return res.status(400).json({ error: 'Categoría inválida' });
    }

    const [result] = await db.execute(
      'INSERT INTO producto (nombre, descripcion, margen_ganancia, id_categoria, estado) VALUES (?, ?, ?, ?, \'activo\')',
      [nombre, descripcion || null, margenGanancia, categoriaId]
    );

    const id_producto = result.insertId;

    if (imagenes && imagenes.length > 0) {
      const imageInserts = imagenes.map(imagen => [
        id_producto,
        imagen.path
      ]);

      const placeholders = imageInserts.map(() => '(?, ?)').join(', ');
      const values = imageInserts.flat();

      await db.execute(
        `INSERT INTO producto_imagen (id_producto, url_imagen) VALUES ${placeholders}`,
        values
      );
    }

    res.status(201).json({ message: 'Producto creado exitosamente', id_producto });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, margen_ganancia, id_categoria } = req.body;

  if (!nombre || id_categoria === undefined || id_categoria === null) {
    return res.status(400).json({ error: 'Nombre y categoría son obligatorios' });
  }

  const categoriaId = Number(id_categoria);
  if (Number.isNaN(categoriaId)) {
    return res.status(400).json({ error: 'Categoría inválida' });
  }

  const margenGanancia = Number(String(margen_ganancia || '0').replace(',', '.'));
  if (Number.isNaN(margenGanancia)) {
    return res.status(400).json({ error: 'Margen de ganancia inválido' });
  }

  try {
    const [categoriaRows] = await db.execute(
      'SELECT id_categoria FROM categoria WHERE id_categoria = ?',
      [categoriaId]
    );

    if (categoriaRows.length === 0) {
      return res.status(400).json({ error: 'Categoría inválida' });
    }

    const [result] = await db.execute(
      `UPDATE producto
       SET nombre = ?, descripcion = ?, margen_ganancia = ?, id_categoria = ?
       WHERE id_producto = ?`,
      [nombre, descripcion || null, margenGanancia, categoriaId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// BORRADO LÓGICO — no elimina el producto de la BD,
// solo lo marca como inactivo (estado = 'inactivo').
// Si el producto tiene historial, DEBE mantenerse inactivo (no puede eliminarse).
const deleteProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [productoRows] = await db.execute(
      'SELECT id_producto FROM producto WHERE id_producto = ?',
      [id]
    );

    if (productoRows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si el producto tiene historial en compras, pedidos o movimientos
    const [comprasCount] = await db.execute(
      'SELECT COUNT(*) as count FROM detalle_compra WHERE id_producto = ?',
      [id]
    );
    const [pedidosCount] = await db.execute(
      'SELECT COUNT(*) as count FROM detalle_pedido WHERE id_producto = ?',
      [id]
    );
    const [movimientosCount] = await db.execute(
      'SELECT COUNT(*) as count FROM movimiento_inventario WHERE id_producto = ?',
      [id]
    );

    const tieneHistorial = 
      comprasCount[0].count > 0 || 
      pedidosCount[0].count > 0 || 
      movimientosCount[0].count > 0;

    await db.execute(
      'UPDATE producto SET estado = \'inactivo\' WHERE id_producto = ?',
      [id]
    );

    const mensaje = tieneHistorial 
      ? 'Producto desactivado. No puede ser eliminado porque tiene historial en el sistema (compras, pedidos o movimientos)'
      : 'Producto desactivado exitosamente';

    res.json({ 
      message: mensaje,
      tieneHistorial: tieneHistorial
    });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// REACTIVAR producto (útil desde el panel admin)
const reactivarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      'UPDATE producto SET estado = \'activo\' WHERE id_producto = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto reactivado exitosamente' });
  } catch (error) {
    console.error('Error al reactivar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  reactivarProducto
};
