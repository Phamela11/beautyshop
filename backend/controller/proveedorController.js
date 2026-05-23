const db = require('../db');

const getProveedores = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id_proveedor, nombre, telefono, direccion FROM proveedor');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProveedor = async (req, res) => {
  const { id_proveedor } = req.params;
  try {
    const [rows] = await db.execute('SELECT id_proveedor, nombre, telefono, direccion FROM proveedor WHERE id_proveedor = ?', [id_proveedor]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createProveedor = async (req, res) => {
  const { nombre, telefono, direccion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO proveedor (nombre, telefono, direccion) VALUES (?, ?, ?)',
      [nombre, telefono || null, direccion || null]
    );
    res.status(201).json({ message: 'Proveedor creado exitosamente', id_proveedor: result.insertId });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProveedor = async (req, res) => {
  const { id_proveedor } = req.params;
  const { nombre, telefono, direccion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE proveedor SET nombre = ?, telefono = ?, direccion = ? WHERE id_proveedor = ?',
      [nombre, telefono || null, direccion || null, id_proveedor]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteProveedor = async (req, res) => {
  const { id_proveedor } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM proveedor WHERE id_proveedor = ?', [id_proveedor]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    if (error.errno === 1451) {
      return res.status(400).json({ error: 'No se puede eliminar el proveedor porque tiene productos o compras asociados' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor
};
