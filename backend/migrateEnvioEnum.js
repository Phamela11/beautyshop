const db = require('./db');

(async () => {
  try {
    await db.execute(
      "UPDATE envio SET estado_envio = 'en camino' WHERE estado_envio = 'pendiente'"
    );

    const [sinEnvio] = await db.execute(
      `SELECT p.id_pedido, u.direccion
       FROM pedido p
       INNER JOIN pago pa ON pa.id_pedido = p.id_pedido
       INNER JOIN usuario u ON u.id_usuario = p.id_usuario
       LEFT JOIN envio e ON e.id_pedido = p.id_pedido
       WHERE e.id_pedido IS NULL`
    );
    for (const row of sinEnvio) {
      await db.execute(
        `INSERT INTO envio (id_pedido, direccion_envio, ciudad, estado_envio, empresa_envio, numero_guia, fecha_envio)
         VALUES (?, ?, NULL, 'en camino', NULL, NULL, NOW())`,
        [row.id_pedido, row.direccion || null]
      );
    }
    if (sinEnvio.length > 0) {
      console.log(`Backfill: ${sinEnvio.length} envío(s) creado(s) para pedidos con pago`);
    }

    await db.execute(
      "ALTER TABLE envio MODIFY COLUMN estado_envio ENUM('en camino','entregado') NOT NULL DEFAULT 'en camino'"
    );
    console.log('Migración envio: enum actualizado a en camino / entregado');
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
})();
