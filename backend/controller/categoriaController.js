const db = require('../db');

const getCategorias = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id_categoria, nombre, descripcion FROM categoria');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT id_categoria, nombre, descripcion FROM categoria WHERE id_categoria = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );
    res.status(201).json({ message: 'Categoría creada exitosamente', id_categoria: result.insertId });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE categoria SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
      [nombre, descripcion || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM categoria WHERE id_categoria = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    if (error.errno === 1451) {
      return res.status(400).json({ error: 'No se puede eliminar la categoría porque tiene productos asociados' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria
};
