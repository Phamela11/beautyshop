// createAdmin.js
// Ejecuta este script UNA SOLA VEZ para crear el administrador
// Comando: node createAdmin.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const db     = require('./db');

async function createAdmin() {
  try {
    // 1. Verificar si el rol admin existe, si no, crearlo
    const [roles] = await db.query("SELECT id_rol FROM rol WHERE nombre = 'admin'");
    
    let id_rol;
    if (roles.length === 0) {
      const [result] = await db.query("INSERT INTO rol (nombre) VALUES ('admin')");
      id_rol = result.insertId;
      console.log('✅ Rol admin creado');
    } else {
      id_rol = roles[0].id_rol;
      console.log('✅ Rol admin encontrado, id:', id_rol);
    }

    // 2. Verificar si el admin ya existe
    const [existe] = await db.query(
      "SELECT id_usuario FROM usuario WHERE correo = ?",
      ['admin@beautyshop.co']
    );

    if (existe.length > 0) {
      console.log('⚠️  El administrador ya existe. No se creó de nuevo.');
      process.exit(0);
    }

    // 3. Hashear contraseña
    const hash = await bcrypt.hash('Admin2025*', 10);

    // 4. Insertar admin
    await db.query(
      `INSERT INTO usuario (nombre, correo, contrasena, id_rol)
       VALUES (?, ?, ?, ?)`,
      ['Administrador BeautyShop', 'admin@beautyshop.co', hash, id_rol]
    );

    console.log('');
    console.log('🎉 Administrador creado exitosamente');
    console.log('──────────────────────────────────');
    console.log('   Correo:     admin@beautyshop.co');
    console.log('   Contrasena: Admin2025*');
    console.log('──────────────────────────────────');
    console.log('⚠️  Cambia la contrasena despues del primer login');
    console.log('');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
