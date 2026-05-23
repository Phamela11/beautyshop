const db = require('../db');
const bcrypt = require('bcrypt');

const getUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.execute(
      `SELECT u.id_usuario, u.nombre, u.correo, u.direccion, u.id_rol, r.nombre AS rol
       FROM usuario u
       LEFT JOIN rol r ON u.id_rol = r.id_rol
       ORDER BY u.id_usuario DESC`
    );

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  const userId = Number(id);
  
  if (!userId) {
    return res.status(400).json({ error: 'id_usuario inválido' });
  }

  try {
    const [usuarios] = await db.execute(
      `SELECT id_usuario, nombre, correo, direccion, id_rol, fecha_registro
       FROM usuario WHERE id_usuario = ?`,
      [userId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, direccion } = req.body;
  const userId = Number(id);

  if (!userId) {
    return res.status(400).json({ error: 'id_usuario inválido' });
  }

  if (!nombre || !correo || !direccion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [existing] = await db.execute(
      `SELECT id_usuario FROM usuario WHERE correo = ? AND id_usuario != ?`,
      [correo, userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado por otro usuario' });
    }

    const [result] = await db.execute(
      `UPDATE usuario SET nombre = ?, correo = ?, direccion = ? WHERE id_usuario = ?`,
      [nombre, correo, direccion, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { contrasena_actual, contrasena_nueva } = req.body;
  const userId = Number(id);

  if (!userId) {
    return res.status(400).json({ error: 'id_usuario inválido' });
  }

  if (!contrasena_actual || !contrasena_nueva) {
    return res.status(400).json({ error: 'Contraseña actual y nueva son obligatorias' });
  }

  if (contrasena_nueva.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [usuarios] = await db.execute(
      `SELECT contrasena FROM usuario WHERE id_usuario = ?`,
      [userId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcrypt.compare(contrasena_actual, usuarios[0].contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(contrasena_nueva, 10);

    await db.execute(
      `UPDATE usuario SET contrasena = ? WHERE id_usuario = ?`,
      [hashedPassword, userId]
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  changePassword
};
