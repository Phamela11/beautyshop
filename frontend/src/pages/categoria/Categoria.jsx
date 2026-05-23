import { useState, useEffect, useCallback } from 'react';
import './Categoria.css';
import { productService } from '../../services/productService';
import DataTable from '../../components/global/DataTable';

const Categoria = () => {
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategoria, setEditingCategoria] = useState(null);

  const loadCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getCategories();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleAddCategoria = () => {
    setEditingCategoria(null);
    setShowModal(true);
  };

  const handleEditCategoria = (categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const categoriaData = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
    };

    try {
      if (editingCategoria) {
        await productService.updateCategory(editingCategoria.id_categoria, categoriaData);
        alert('Categoría actualizada exitosamente');
      } else {
        await productService.createCategory(categoriaData);
        alert('Categoría creada exitosamente');
      }
      setShowModal(false);
      setEditingCategoria(null);
      loadCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar categoría');
    }
  };

  const handleDeleteCategoria = async (categoria) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    try {
      await productService.deleteCategory(categoria.id_categoria);
      alert('Categoría eliminada exitosamente');
      loadCategorias();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert(error.message || 'Error al eliminar categoría');
    }
  };

  const columns = [
    {
      header: 'ID',
      key: 'id_categoria'
    },
    {
      header: 'Nombre',
      key: 'nombre'
    },
    {
      header: 'Descripción',
      key: 'descripcion'
    },
    {
      header: 'Acciones',
      render: (categoria) => (
        <>
          <button className="btn-edit" onClick={() => handleEditCategoria(categoria)}>Editar</button>
          <button className="btn-delete" onClick={() => handleDeleteCategoria(categoria)}>Eliminar</button>
        </>
      )
    }
  ];

  return (
    <div className="categoria-container">
      <div className="categoria-header">
        <h2>Gestión de Categorías</h2>
        <button className="btn-add" onClick={handleAddCategoria}>
          Agregar Categoría
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categorias}
        loading={loading}
        emptyMessage="No hay categorías en la base de datos."
        loadingMessage="Cargando categorías..."
      />

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategoria ? 'Editar Categoría' : 'Agregar Categoría'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <form className="categoria-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre:</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    defaultValue={editingCategoria?.nombre || ''}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción:</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    defaultValue={editingCategoria?.descripcion || ''}
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" type="button" onClick={handleCloseModal}>Cancelar</button>
                  <button className="btn-save" type="submit">
                    {editingCategoria ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categoria;