const db = require('../db');

// ── 1. REPORTE DE GANANCIAS POR LOTE (productos) ─────────────────────────────
const getReporteGanancias = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  try {
    const params = [];
    let fechaWhere = '';
    if (fecha_inicio) { fechaWhere += ' AND mi.fecha >= ?';                           params.push(fecha_inicio); }
    if (fecha_fin)    { fechaWhere += ' AND mi.fecha <= DATE_ADD(?, INTERVAL 1 DAY)'; params.push(fecha_fin);    }

    const [rows] = await db.execute(`
      SELECT
        p.id_producto,
        p.nombre                                              AS nombre_producto,
        COALESCE(c.nombre, 'Sin categoría')                   AS categoria,
        p.margen_ganancia,
        dc.id_detalle                                         AS id_lote,
        dc.fecha_ingreso                                      AS fecha_compra,
        dc.precio_compra                                      AS costo_lote,
        dc.cantidad                                           AS cantidad_original,
        mi.id_movimiento,
        mi.fecha                                              AS fecha_venta,
        mi.cantidad                                           AS cantidad_vendida,
        mi.precio_compra                                      AS costo_unitario_venta,
        mi.id_pedido,
        ROUND(mi.precio_compra * (1 + p.margen_ganancia / 100), 2) AS precio_venta
      FROM movimiento_inventario mi
      INNER JOIN detalle_compra dc ON dc.id_detalle  = mi.id_detalle_compra
      INNER JOIN producto       p  ON p.id_producto  = mi.id_producto
      LEFT  JOIN categoria      c  ON c.id_categoria = p.id_categoria
      WHERE mi.tipo = 'salida' AND mi.id_detalle_compra IS NOT NULL AND mi.id_pedido IS NOT NULL
      ${fechaWhere}
      ORDER BY p.nombre ASC, dc.fecha_ingreso ASC, mi.fecha ASC
    `, params);

    const productos = {};
    for (const row of rows) {
      const pId = row.id_producto;
      if (!productos[pId]) {
        productos[pId] = { id_producto: pId, nombre: row.nombre_producto, categoria: row.categoria, margen: Number(row.margen_ganancia), lotes: {}, total_costo: 0, total_ingreso: 0, total_ganancia: 0, total_vendido: 0 };
      }
      const lId = row.id_lote;
      if (!productos[pId].lotes[lId]) {
        productos[pId].lotes[lId] = { id_lote: lId, fecha_compra: row.fecha_compra, costo_lote: Number(row.costo_lote), cantidad_original: Number(row.cantidad_original), ventas: [], total_vendido: 0, total_costo: 0, total_ingreso: 0, total_ganancia: 0 };
      }
      const cant = Number(row.cantidad_vendida), pC = Number(row.costo_unitario_venta), pV = Number(row.precio_venta);
      const cT = pC * cant, iT = pV * cant, g = iT - cT;
      productos[pId].lotes[lId].ventas.push({ id_pedido: row.id_pedido, fecha_venta: row.fecha_venta, cantidad: cant, costo_unitario: pC, precio_venta: pV, costo_total: cT, ingreso_total: iT, ganancia: g });
      productos[pId].lotes[lId].total_vendido  += cant;
      productos[pId].lotes[lId].total_costo    += cT;
      productos[pId].lotes[lId].total_ingreso  += iT;
      productos[pId].lotes[lId].total_ganancia += g;
      productos[pId].total_costo    += cT;
      productos[pId].total_ingreso  += iT;
      productos[pId].total_ganancia += g;
      productos[pId].total_vendido  += cant;
    }
    const finalResult = Object.values(productos).map(p => ({ ...p, lotes: Object.values(p.lotes) }));
    res.json({
      productos: finalResult,
      resumen: {
        total_costo:     finalResult.reduce((a, b) => a + b.total_costo,    0),
        total_ingreso:   finalResult.reduce((a, b) => a + b.total_ingreso,  0),
        total_ganancia:  finalResult.reduce((a, b) => a + b.total_ganancia, 0),
        total_productos: finalResult.length,
      },
    });
  } catch (error) {
    console.error('Error en reporte ganancias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 2. REPORTE DE USUARIOS / CLIENTES ────────────────────────────────────────
const getReporteUsuarios = async (req, res) => {
  const { fecha_inicio, fecha_fin, id_usuario } = req.query;
  try {
    const params = [];
    let where = "WHERE r.nombre = 'cliente'";
    if (id_usuario) { where += ' AND u.id_usuario = ?'; params.push(Number(id_usuario)); }

    let fechaWhere = '';
    if (fecha_inicio) { fechaWhere += ' AND p.fecha >= ?';                           params.push(fecha_inicio); }
    if (fecha_fin)    { fechaWhere += ' AND p.fecha <= DATE_ADD(?, INTERVAL 1 DAY)'; params.push(fecha_fin);    }

    const [rows] = await db.execute(`
      SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        u.fecha_registro,
        COUNT(DISTINCT p.id_pedido)                           AS total_pedidos,
        COALESCE(SUM(p.total), 0)                             AS total_gastado,
        COALESCE(SUM(dp.cantidad), 0)                         AS total_unidades,
        MIN(p.fecha)                                          AS primera_compra,
        MAX(p.fecha)                                          AS ultima_compra,
        GROUP_CONCAT(DISTINCT pr.nombre ORDER BY pr.nombre SEPARATOR ', ') AS productos
      FROM usuario u
      LEFT JOIN rol r ON r.id_rol = u.id_rol
      LEFT JOIN pedido p ON p.id_usuario = u.id_usuario ${fechaWhere}
      LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
      LEFT JOIN producto pr ON pr.id_producto = dp.id_producto
      ${where}
      GROUP BY u.id_usuario, u.nombre, u.correo, u.fecha_registro
      ORDER BY total_gastado DESC
    `, params);

    const usuarios = rows.map(r => ({
      id_usuario:    r.id_usuario,
      nombre:        r.nombre,
      correo:        r.correo,
      fecha_registro:r.fecha_registro,
      total_pedidos: Number(r.total_pedidos),
      total_gastado: Number(r.total_gastado),
      total_unidades:Number(r.total_unidades),
      primera_compra:r.primera_compra,
      ultima_compra: r.ultima_compra,
      productos:     r.productos || '—',
    }));

    res.json({
      usuarios,
      resumen: {
        total_clientes:  usuarios.length,
        total_pedidos:   usuarios.reduce((a, u) => a + u.total_pedidos,  0),
        total_ingresos:  usuarios.reduce((a, u) => a + u.total_gastado,  0),
        total_unidades:  usuarios.reduce((a, u) => a + u.total_unidades, 0),
      },
    });
  } catch (error) {
    console.error('Error en reporte usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 3. REPORTE DE ENVÍOS ──────────────────────────────────────────────────────
const getReporteEnvios = async (req, res) => {
  const { fecha_inicio, fecha_fin, estado } = req.query;
  try {
    const params = [];
    let where = 'WHERE 1=1';
    if (estado)      { where += ' AND e.estado_envio = ?';                           params.push(estado);      }
    if (fecha_inicio){ where += ' AND e.fecha_envio >= ?';                           params.push(fecha_inicio);}
    if (fecha_fin)   { where += ' AND e.fecha_envio <= DATE_ADD(?, INTERVAL 1 DAY)'; params.push(fecha_fin);   }

    const [rows] = await db.execute(`
      SELECT
        e.id_envio,
        e.id_pedido,
        u.nombre                                              AS cliente,
        e.ciudad,
        e.empresa_envio,
        e.numero_guia,
        e.estado_envio,
        e.fecha_envio,
        p.total,
        GROUP_CONCAT(pr.nombre ORDER BY pr.nombre SEPARATOR ', ') AS productos
      FROM envio e
      INNER JOIN pedido p ON p.id_pedido = e.id_pedido
      INNER JOIN usuario u ON u.id_usuario = p.id_usuario
      LEFT  JOIN detalle_pedido dp ON dp.id_pedido = e.id_pedido
      LEFT  JOIN producto pr ON pr.id_producto = dp.id_producto
      ${where}
      GROUP BY e.id_envio, e.id_pedido, u.nombre, e.ciudad, e.empresa_envio, e.numero_guia, e.estado_envio, e.fecha_envio, p.total
      ORDER BY e.fecha_envio DESC, e.id_envio DESC
    `, params);

    // Conteo por transportadora
    const porTransportadora = {};
    for (const r of rows) {
      const key = r.empresa_envio || 'Sin asignar';
      porTransportadora[key] = (porTransportadora[key] || 0) + 1;
    }

    res.json({
      envios: rows,
      resumen: {
        total:               rows.length,
        total_en_camino:     rows.filter(r => r.estado_envio === 'en camino').length,
        total_entregado:     rows.filter(r => r.estado_envio === 'entregado').length,
        por_transportadora:  porTransportadora,
      },
    });
  } catch (error) {
    console.error('Error en reporte envíos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ── 4. ESTADÍSTICAS GENERALES PARA HOME ──────────────────────────────────────
const getEstadisticasHome = async (req, res) => {
  try {
    const [[{ total_productos }]] = await db.execute(
      "SELECT COUNT(*) as total_productos FROM producto WHERE estado = 'activo'"
    );
    const [[{ total_clientes }]] = await db.execute(
      "SELECT COUNT(*) as total_clientes FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE r.nombre = 'cliente'"
    );
    const [[{ total_pedidos }]] = await db.execute(
      "SELECT COUNT(*) as total_pedidos FROM pedido"
    );
    // Producto más vendido
    const [masVendido] = await db.execute(`
      SELECT p.id_producto, p.nombre, SUM(dp.cantidad) as total_vendido,
             pi.url_imagen,
             (SELECT mi2.precio_compra * (1 + p.margen_ganancia/100)
              FROM movimiento_inventario mi2
              WHERE mi2.id_producto = p.id_producto AND mi2.tipo = 'salida'
              ORDER BY mi2.fecha DESC LIMIT 1) as precio
      FROM detalle_pedido dp
      JOIN producto p ON p.id_producto = dp.id_producto
      LEFT JOIN producto_imagen pi ON pi.id_producto = p.id_producto
      GROUP BY p.id_producto, p.nombre, pi.url_imagen, p.margen_ganancia
      ORDER BY total_vendido DESC
      LIMIT 1
    `);

    res.json({
      total_productos: Number(total_productos),
      total_clientes:  Number(total_clientes),
      total_pedidos:   Number(total_pedidos),
      mas_vendido:     masVendido[0] || null,
    });
  } catch (error) {
    console.error('Error en estadisticas home:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getReporteGanancias, getReporteUsuarios, getReporteEnvios, getEstadisticasHome };
