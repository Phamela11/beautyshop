const db = require('../db');

/** Nombre de tabla con tilde (MySQL) */
const T = '`reseña`';

const getResenasPanel = async (req, res) => {
  const { id_usuario } = req.params;
  const uid = Number(id_usuario);
  if (!uid) {
    return res.status(400).json({ error: 'id_usuario inválido' });
  }

  try {
    const [resenas] = await db.execute(
      `SELECT r.id_resena, r.id_usuario, r.id_producto, r.id_pedido,
              r.calificacion, r.comentario, r.fecha,
              p.nombre AS nombre_producto
       FROM ${T} r
       INNER JOIN producto p ON p.id_producto = r.id_producto
       WHERE r.id_usuario = ?
       ORDER BY r.fecha DESC, r.id_resena DESC`,
      [uid]
    );

    const [porValorar] = await db.execute(
      `SELECT pe.id_pedido,
              pe.fecha AS fecha_pedido,
              dp.id_producto,
              pr.nombre AS nombre_producto,
              SUM(dp.cantidad) AS cantidad
       FROM pedido pe
       INNER JOIN envio ev ON ev.id_pedido = pe.id_pedido AND ev.estado_envio = 'entregado'
       INNER JOIN detalle_pedido dp ON dp.id_pedido = pe.id_pedido
       INNER JOIN producto pr ON pr.id_producto = dp.id_producto
       WHERE pe.id_usuario = ?
         AND NOT EXISTS (
           SELECT 1 FROM ${T} r
           WHERE r.id_usuario = pe.id_usuario
             AND r.id_pedido = pe.id_pedido
             AND r.id_producto = dp.id_producto
         )
       GROUP BY pe.id_pedido, pe.fecha, dp.id_producto, pr.nombre
       ORDER BY pe.fecha DESC, pr.nombre ASC`,
      [uid]
    );

    res.json({ resenas, porValorar });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getResenasPorProducto = async (req, res) => {
  const { id_producto } = req.params;
  const prid = Number(id_producto);
  if (!prid) {
    return res.status(400).json({ error: 'id_producto inválido' });
  }

  try {
    const [resenas] = await db.execute(
      `SELECT r.id_resena, r.id_usuario, r.id_producto, r.id_pedido,
              r.calificacion, r.comentario, r.fecha,
              u.nombre AS nombre_usuario
       FROM ${T} r
       INNER JOIN usuario u ON u.id_usuario = r.id_usuario
       WHERE r.id_producto = ?
       ORDER BY r.fecha DESC, r.id_resena DESC`,
      [prid]
    );

    res.json({ resenas });
  } catch (error) {
    console.error('Error al obtener reseñas por producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createResena = async (req, res) => {
  const { id_usuario, id_pedido, id_producto, calificacion, comentario } = req.body;

  const uid = Number(id_usuario);
  const pid = Number(id_pedido);
  const prid = Number(id_producto);
  const cal = Number(calificacion);

  if (!uid || !pid || !prid) {
    return res.status(400).json({ error: 'id_usuario, id_pedido e id_producto son obligatorios' });
  }
  if (!Number.isInteger(cal) || cal < 1 || cal > 5) {
    return res.status(400).json({ error: 'calificacion debe ser un entero entre 1 y 5' });
  }

  const comentarioTrim =
    comentario === undefined || comentario === null
      ? null
      : String(comentario).trim() || null;

  try {
    const [ped0] = await db.execute(
      `SELECT id_pedido, id_usuario FROM pedido WHERE id_pedido = ?`,
      [pid]
    );
    if (ped0.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    if (Number(ped0[0].id_usuario) !== uid) {
      return res.status(403).json({ error: 'El pedido no pertenece a este usuario' });
    }

    const [envEnt] = await db.execute(
      `SELECT 1 FROM envio WHERE id_pedido = ? AND estado_envio = 'entregado' LIMIT 1`,
      [pid]
    );
    if (envEnt.length === 0) {
      return res.status(400).json({
        error:
          'Solo puedes reseñar cuando el envío del pedido está en estado entregado (módulo Envíos).',
      });
    }

    const [det] = await db.execute(
      `SELECT 1 FROM detalle_pedido
       WHERE id_pedido = ? AND id_producto = ?
       LIMIT 1`,
      [pid, prid]
    );
    if (det.length === 0) {
      return res.status(400).json({ error: 'Ese producto no figura en el pedido' });
    }

    const [dup] = await db.execute(
      `SELECT id_resena FROM ${T}
       WHERE id_usuario = ? AND id_pedido = ? AND id_producto = ?
       LIMIT 1`,
      [uid, pid, prid]
    );
    if (dup.length > 0) {
      return res.status(409).json({ error: 'Ya existe una reseña para este producto en este pedido' });
    }

    const [ins] = await db.execute(
      `INSERT INTO ${T} (id_usuario, id_producto, id_pedido, calificacion, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [uid, prid, pid, cal, comentarioTrim]
    );

    res.status(201).json({
      message: 'Reseña creada',
      id_resena: ins.insertId,
      id_usuario: uid,
      id_pedido: pid,
      id_producto: prid,
      calificacion: cal,
      comentario: comentarioTrim,
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getResenasPanel,
  getResenasPorProducto,
  createResena,
};
