const db = require('./db');
(async () => {
  try {
    const tables = ['producto','producto_imagen','detalle_compra','movimiento_inventario','pedido','pedido_detalle'];
    for (const t of tables) {
      try {
        const [rows] = await db.execute(`SHOW CREATE TABLE \`${t}\``);
        console.log('TABLE', t, '\n', rows[0]['Create Table'], '\n-----');
      } catch (e) {
        console.error('ERROR SHOW CREATE TABLE', t, e.message);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
})();
