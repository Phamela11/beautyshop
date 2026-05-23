const db = require('../db');

const LIMITE_CARRITO = 30;

const obtenerCarritoActivo = async (idUsuario, connection = db) => {
  const [carritos] = await connection.execute(
    `SELECT id_carrito
     FROM carrito
     WHERE id_usuario = ? AND estado = 'activo'
     ORDER BY id_carrito DESC
     LIMIT 1`,
    [idUsuario]
  );

  if (carritos.length > 0) return carritos[0].id_carrito;

  const [result] = await connection.execute(
    `INSERT INTO carrito (id_usuario, estado) VALUES (?, 'activo')`,
    [idUsuario]
  );
  return result.insertId;
};

const getCarritoUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const idCarrito = await obtenerCarritoActivo(id_usuario);
    const [items] = await db.execute(
      `SELECT cd.id_detalle, cd.id_carrito, cd.id_producto, cd.cantidad,
              p.nombre, p.descripcion, p.margen_ganancia,
              COALESCE(pi.imagenes, '') AS imagenes
       FROM carrito_detalle cd
       INNER JOIN producto p ON p.id_producto = cd.id_producto
       LEFT JOIN (
         SELECT id_producto, GROUP_CONCAT(url_imagen ORDER BY id_imagen SEPARATOR ',') AS imagenes
         FROM producto_imagen
         GROUP BY id_producto
       ) pi ON pi.id_producto = p.id_producto
       WHERE cd.id_carrito = ?`,
      [idCarrito]
    );

    const totalProductos = items.reduce((acc, item) => acc + Number(item.cantidad), 0);
    const mappedItems = items.map(item => ({
      ...item,
      imagenes: item.imagenes ? String(item.imagenes).split(',') : []
    }));

    res.json({
      id_carrito: idCarrito,
      total_productos: totalProductos,
      limite: LIMITE_CARRITO,
      items: mappedItems
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const addProductoCarrito = async (req, res) => {
  const { id_usuario } = req.params;
  const { id_producto, cantidad = 1 } = req.body;

  if (!id_producto || Number(cantidad) <= 0) {
    return res.status(400).json({ error: 'id_producto y cantidad > 0 son obligatorios' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const idCarrito = await obtenerCarritoActivo(id_usuario, connection);

    const [itemsActuales] = await connection.execute(
      `SELECT id_detalle, id_producto, cantidad
       FROM carrito_detalle
       WHERE id_carrito = ?`,
      [idCarrito]
    );

    const totalActual = itemsActuales.reduce((acc, item) => acc + Number(item.cantidad), 0);
    const nuevoTotal = totalActual + Number(cantidad);

    if (nuevoTotal > LIMITE_CARRITO) {
      await connection.rollback();
      return res.status(400).json({
        error: `No puedes tener más de ${LIMITE_CARRITO} productos en el carrito.`
      });
    }

    const itemExistente = itemsActuales.find((item) => Number(item.id_producto) === Number(id_producto));
    if (itemExistente) {
      await connection.execute(
        `UPDATE carrito_detalle
         SET cantidad = cantidad + ?
         WHERE id_detalle = ?`,
        [cantidad, itemExistente.id_detalle]
      );
    } else {
      await connection.execute(
        `INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad)
         VALUES (?, ?, ?)`,
        [idCarrito, id_producto, cantidad]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Producto agregado al carrito', total_productos: nuevoTotal });
  } catch (error) {
    await connection.rollback();
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};

const updateCantidadCarrito = async (req, res) => {
  const { id_usuario, id_producto } = req.params;
  const { cantidad } = req.body;

  if (cantidad === undefined || Number(cantidad) < 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const idCarrito = await obtenerCarritoActivo(id_usuario, connection);

    const [itemsActuales] = await connection.execute(
      `SELECT id_detalle, id_producto, cantidad
       FROM carrito_detalle
       WHERE id_carrito = ?`,
      [idCarrito]
    );

    const itemExistente = itemsActuales.find((item) => Number(item.id_producto) === Number(id_producto));
    if (!itemExistente) {
      await connection.rollback();
      return res.status(404).json({ error: 'Producto no encontrado en carrito' });
    }

    const totalSinItem = itemsActuales.reduce((acc, item) => {
      if (Number(item.id_producto) === Number(id_producto)) return acc;
      return acc + Number(item.cantidad);
    }, 0);
    const nuevoTotal = totalSinItem + Number(cantidad);

    if (nuevoTotal > LIMITE_CARRITO) {
      await connection.rollback();
      return res.status(400).json({
        error: `No puedes tener más de ${LIMITE_CARRITO} productos en el carrito.`
      });
    }

    if (Number(cantidad) === 0) {
      await connection.execute(`DELETE FROM carrito_detalle WHERE id_detalle = ?`, [itemExistente.id_detalle]);
    } else {
      await connection.execute(
        `UPDATE carrito_detalle SET cantidad = ? WHERE id_detalle = ?`,
        [cantidad, itemExistente.id_detalle]
      );
    }

    await connection.commit();
    res.json({ message: 'Carrito actualizado', total_productos: nuevoTotal });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getCarritoUsuario,
  addProductoCarrito,
  updateCantidadCarrito
};
