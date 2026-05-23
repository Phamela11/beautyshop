const db = require('../db');

const ESTADOS_ENVIO = ['en camino', 'entregado'];

const mapRow = (row) => ({
  id_envio: row.id_envio,
  id_pedido: row.id_pedido,
  cliente: row.cliente,
  telefono: row.telefono,
  ciudad: row.ciudad,
  ciudad_envio: row.ciudad_envio != null ? String(row.ciudad_envio) : '',
  direccion: row.direccion || '',
  transportadora: row.transportadora,
  guia: row.guia || null,
  empresa_envio: row.empresa_envio != null ? String(row.empresa_envio) : '',
  estado: row.estado,
  intentos: Number(row.intentos) || 0,
  fecha: row.fecha || '',
  productos: row.productos_csv
    ? String(row.productos_csv).split('||').filter(Boolean)
    : [],
  incidencia: row.incidencia || '',
});

const getEnvios = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         e.id_envio,
         e.id_pedido,
         u.nombre AS cliente,
         COALESCE(NULLIF(TRIM(u.correo), ''), '—') AS telefono,
         COALESCE(NULLIF(TRIM(e.ciudad), ''), 'N/D') AS ciudad,
         e.ciudad AS ciudad_envio,
         COALESCE(NULLIF(TRIM(e.direccion_envio), ''), u.direccion, '') AS direccion,
         COALESCE(NULLIF(TRIM(e.empresa_envio), ''), 'Sin asignar') AS transportadora,
         e.numero_guia AS guia,
         e.empresa_envio AS empresa_envio,
         e.estado_envio AS estado,
         0 AS intentos,
         COALESCE(DATE_FORMAT(e.fecha_envio, '%d/%m/%Y %H:%i'), '') AS fecha,
         (
           SELECT GROUP_CONCAT(pr.nombre ORDER BY pr.nombre SEPARATOR '||')
           FROM detalle_pedido dp
           INNER JOIN producto pr ON pr.id_producto = dp.id_producto
           WHERE dp.id_pedido = e.id_pedido
         ) AS productos_csv,
         '' AS incidencia
       FROM envio e
       INNER JOIN pedido p ON p.id_pedido = e.id_pedido
       INNER JOIN usuario u ON u.id_usuario = p.id_usuario
       WHERE e.estado_envio IN ('en camino', 'entregado')
       ORDER BY e.fecha_envio DESC, e.id_envio DESC`
    );
    res.json(rows.map(mapRow));
  } catch (error) {
    console.error('Error al obtener envíos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateEstadoEnvio = async (req, res) => {
  const { id_envio } = req.params;
  const { estado } = req.body;
  const id = Number(id_envio);

  if (!ESTADOS_ENVIO.includes(estado)) {
    return res.status(400).json({ error: 'Estado de envío inválido' });
  }

  if (!id) {
    return res.status(400).json({ error: 'id_envio inválido' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [found] = await connection.execute(
      `SELECT id_envio, id_pedido, empresa_envio
       FROM envio
       WHERE id_envio = ?
       FOR UPDATE`,
      [id]
    );

    if (found.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Envío no encontrado' });
    }

    const envio = found[0];
    const transportadora = String(envio.empresa_envio || '').trim();

    if (estado === 'entregado' && !transportadora) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Debes asignar una transportadora antes de marcar el envío como entregado.',
      });
    }

    await connection.execute(
      `UPDATE envio SET estado_envio = ?, fecha_envio = COALESCE(fecha_envio, NOW()) WHERE id_envio = ?`,
      [estado, id]
    );

    if (envio.id_pedido) {
      await connection.execute(
        "UPDATE pedido SET estado = 'enviado' WHERE id_pedido = ?",
        [envio.id_pedido]
      );
    }

    await connection.commit();
    res.json({ ok: true, id_envio: id, estado });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar estado de envío:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};

const updateEnvioLogistica = async (req, res) => {
  const { id_envio } = req.params;
  const { empresa_envio, numero_guia, ciudad } = req.body;
  const id = Number(id_envio);
  if (!id) {
    return res.status(400).json({ error: 'id_envio inválido' });
  }

  const emp =
    empresa_envio === undefined || empresa_envio === null
      ? null
      : String(empresa_envio).trim() || null;
  const guia =
    numero_guia === undefined || numero_guia === null
      ? null
      : String(numero_guia).trim() || null;
  const ciu =
    ciudad === undefined || ciudad === null ? undefined : String(ciudad).trim() || null;

  try {
    const [found] = await db.execute('SELECT id_envio FROM envio WHERE id_envio = ?', [id]);
    if (found.length === 0) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }

    if (ciu !== undefined) {
      await db.execute(
        'UPDATE envio SET empresa_envio = ?, numero_guia = ?, ciudad = ? WHERE id_envio = ?',
        [emp, guia, ciu, id]
      );
    } else {
      await db.execute(
        'UPDATE envio SET empresa_envio = ?, numero_guia = ? WHERE id_envio = ?',
        [emp, guia, id]
      );
    }

    res.json({ ok: true, id_envio: id });
  } catch (error) {
    console.error('Error al actualizar logística de envío:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/** Crea fila de envío al confirmar pago (idempotente). `connection` opcional para transacciones. */
const crearEnvioSiNoExiste = async (id_pedido, connection = db) => {
  const [ex] = await connection.execute(
    'SELECT id_envio FROM envio WHERE id_pedido = ?',
    [id_pedido]
  );
  if (ex.length > 0) return;

  const [ped] = await connection.execute(
    `SELECT p.id_pedido, u.direccion
     FROM pedido p
     INNER JOIN usuario u ON u.id_usuario = p.id_usuario
     WHERE p.id_pedido = ?`,
    [id_pedido]
  );
  if (ped.length === 0) return;

  await connection.execute(
    `INSERT INTO envio (id_pedido, direccion_envio, ciudad, estado_envio, empresa_envio, numero_guia, fecha_envio)
     VALUES (?, ?, NULL, 'pendiente', NULL, NULL, NULL)`,
    [id_pedido, ped[0].direccion || null]
  );
};

module.exports = {
  getEnvios,
  updateEstadoEnvio,
  updateEnvioLogistica,
  crearEnvioSiNoExiste,
  ESTADOS_ENVIO,
};
