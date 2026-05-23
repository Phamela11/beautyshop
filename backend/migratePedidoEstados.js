const db = require('./db');

(async () => {
  try {
    await db.execute(
      "UPDATE pedido SET estado = 'enviado' WHERE estado = 'entregado'"
    );
    await db.execute(
      "ALTER TABLE pedido MODIFY COLUMN estado ENUM('pendiente','enviado') NOT NULL DEFAULT 'pendiente'"
    );
    console.log('OK: pedido solo pendiente | enviado (entregado pasa a envíos)');
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
})();
