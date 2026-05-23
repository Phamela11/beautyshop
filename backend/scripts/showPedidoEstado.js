const db = require('../db');
(async () => {
  try {
    const [r] = await db.execute('SHOW COLUMNS FROM pedido LIKE "estado"');
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
})();
