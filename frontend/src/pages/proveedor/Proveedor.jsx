import { useState, useEffect } from 'react';
import './Proveedor.css';
import { useProveedor } from '../../hooks/useProveedor';
import DataTable from '../../components/global/DataTable';

const Proveedor = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const { proveedores, loading, loadProveedores, createProveedor, updateProveedor, deleteProveedor } = useProveedor();

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const handleAddProveedor = () => {
    setEditingProveedor(null);
    setShowModal(true);
  };

  const handleEditProveedor = (proveedor) => {
    setEditingProveedor(proveedor);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProveedor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const proveedorData = {
      nombre: formData.get('nombre'),
      telefono: formData.get('telefono'),
      direccion: formData.get('direccion'),
    };

    try {
      if (editingProveedor) {
        const result = await updateProveedor(editingProveedor.id_proveedor, proveedorData);
        if (result.success) {
          alert('Proveedor actualizado exitosamente');
        } else {
          alert('Error al actualizar proveedor');
        }
      } else {
        const result = await createProveedor(proveedorData);
        if (result.success) {
          alert('Proveedor creado exitosamente');
        } else {
          alert('Error al crear proveedor');
        }
      }
      setShowModal(false);
      setEditingProveedor(null);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      alert('Error al guardar proveedor');
    }
  };

  const handleDeleteProveedor = async (proveedor) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el proveedor "${proveedor.nombre}"?`)) {
      return;
    }

    try {
      const result = await deleteProveedor(proveedor.id_proveedor);
      if (result.success) {
        alert('Proveedor eliminado exitosamente');
      } else {
        alert('Error al eliminar proveedor');
      }
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      alert(error.message || 'Error al eliminar proveedor');
    }
  };

  const columns = [
    {
      header: 'ID',
      key: 'id_proveedor'
    },
    {
      header: 'Nombre',
      key: 'nombre'
    },
    {
      header: 'Teléfono',
      key: 'telefono'
    },
    {
      header: 'Dirección',
      key: 'direccion'
    },
    {
      header: 'Acciones',
      render: (proveedor) => (
        <>
          <button className="btn-edit" onClick={() => handleEditProveedor(proveedor)}>Editar</button>
          <button className="btn-delete" onClick={() => handleDeleteProveedor(proveedor)}>Eliminar</button>
        </>
      )
    }
  ];

  return (
    <div className="proveedor-container">
      <div className="proveedor-header">
        <h2>Gestión de Proveedores</h2>
        <button className="btn-add" onClick={handleAddProveedor}>
          Agregar Proveedor
        </button>
      </div>

      <DataTable
        columns={columns}
        data={proveedores}
        loading={loading}
        emptyMessage="No hay proveedores en la base de datos."
        loadingMessage="Cargando proveedores..."
      />

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProveedor ? 'Editar Proveedor' : 'Agregar Proveedor'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <form className="proveedor-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre:</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    defaultValue={editingProveedor?.nombre || ''}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono:</label>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    defaultValue={editingProveedor?.telefono || ''}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="direccion">Dirección:</label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    rows="3"
                    defaultValue={editingProveedor?.direccion || ''}
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" type="button" onClick={handleCloseModal}>Cancelar</button>
                  <button className="btn-save" type="submit">
                    {editingProveedor ? 'Actualizar' : 'Guardar'}
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

export default Proveedor;
