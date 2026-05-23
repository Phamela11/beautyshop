const db = require('./db');
const fs = require('fs').promises;
const path = require('path');

const tables = [
  'reseña',
  'envio',
  'pago',
  'detalle_pedido',
  'pedido',
  'carrito_detalle',
  'carrito',
  'movimiento_inventario',
  'detalle_compra',
  'compra',
  'producto_imagen',
  'producto',
  'categoria',
  'proveedor',
  'usuario',
  'rol'
];

const uploadsDir = path.join(__dirname, 'uploads', 'productos');

const clearUploadsFolder = async () => {
  try {
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(uploadsDir, entry.name);
      if (entry.isDirectory()) {
        await fs.rm(entryPath, { recursive: true, force: true });
      } else {
        await fs.unlink(entryPath);
      }
    }
    console.log(`🗑️ Todos los archivos en ${uploadsDir} han sido eliminados`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`ℹ️ No existe el directorio de uploads: ${uploadsDir}`);
      return;
    }
    throw error;
  }
};

(async () => {
  try {
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔧 FOREIGN_KEY_CHECKS disabled');

    for (const table of tables) {
      try {
        await db.execute(`TRUNCATE TABLE \`${table}\``);
        await db.execute(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
        console.log(`✅ Datos borrados y AUTO_INCREMENT reiniciado: ${table}`);
      } catch (innerError) {
        console.warn(`⚠️ No se pudo resetear la tabla ${table}: ${innerError.message}`);
      }
    }

    await clearUploadsFolder();
  } catch (error) {
    console.error('❌ Error al resetear la base de datos:', error.message);
  } finally {
    try {
      await db.execute('SET FOREIGN_KEY_CHECKS = 1');
      console.log('🔧 FOREIGN_KEY_CHECKS re-enabled');
    } catch (finalError) {
      console.error('❌ Error al volver a habilitar FOREIGN_KEY_CHECKS:', finalError.message);
    }
    process.exit();
  }
})();
