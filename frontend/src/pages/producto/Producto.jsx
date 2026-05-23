import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit } from 'lucide-react';
import './Producto.css';
import { productService } from '../../services/productService';
import DataTable from '../../components/global/DataTable';

const Producto = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProducto, setEditingProducto] = useState(null);

    const [categorias, setCategorias] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const loadProductos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategorias = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data = await productService.getCategories();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategorias([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProductos();
    loadCategorias();
  }, [loadProductos, loadCategorias]);

  const handleAddProduct = () => {
    setEditingProducto(null);
    setShowModal(true);
  };

  const handleEditProducto = (producto) => {
    setEditingProducto(producto);
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImages([]);
    setEditingProducto(null);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedImages((prev) => {
      const merged = [...prev, ...files];
      if (merged.length > 5) {
        alert('Puedes subir hasta 5 imágenes por producto. Se usarán las primeras 5 imágenes.');
      }
      return merged.slice(0, 5);
    });

    e.target.value = null;
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleDeleteProducto = async (producto) => {
    const confirmDelete = window.confirm(`¿Desactivar producto "${producto.nombre}"?`);
    if (!confirmDelete) return;

    try {
      const response = await productService.deleteProduct(producto.id_producto);
      if (response.tieneHistorial) {
        alert('Producto desactivado. No puede ser eliminado porque tiene historial en el sistema (compras, pedidos o movimientos).');
      } else {
        alert('Producto desactivado exitosamente');
      }
      loadProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert(error.message || 'Error al eliminar producto');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const rawMargen = formData.get('margen_ganancia')?.toString() || '';
    const productData = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      margen_ganancia: rawMargen.replace(',', '.'),
      id_categoria: formData.get('id_categoria'),
    };

    if (!editingProducto && selectedImages.length < 5) {
      alert('Debes seleccionar 5 imágenes para este producto.');
      return;
    }

    try {
      if (editingProducto) {
        await productService.updateProduct(editingProducto.id_producto, productData);
        alert('Producto actualizado exitosamente');
      } else {
        await productService.createProduct(productData, selectedImages);
        alert('Producto creado exitosamente');
      }
      setShowModal(false);
      setSelectedImages([]);
      setEditingProducto(null);
      loadProductos();
      loadCategorias();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert(error.message || 'Error al guardar producto');
    }
  };

  const columns = [
    {
      header: 'ID',
      key: 'id_producto'
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
      header: 'Margen Ganancia',
      render: (producto) => `${producto.margen_ganancia}%`
    },
    {
      header: 'Precio Venta',
      render: (producto) => producto.precio
          ? `$${Number(producto.precio).toLocaleString('es-CO', {minimumFractionDigits:0})}`
          : <span style={{fontSize:10,fontWeight:700,color:'#c9536a',background:'#fdf0f2',border:'1px solid #f0c0ca',padding:'2px 8px',borderRadius:20,letterSpacing:'0.06em',textTransform:'uppercase'}}>Agotado</span>
    },
    {
      header: 'Costo Promedio',
      render: (producto) => producto.costo_promedio
          ? `$${Number(producto.costo_promedio).toLocaleString('es-CO', {minimumFractionDigits:0})}`
          : '—'
    },
    {
      header: 'Último Costo',
      render: (producto) => producto.ultimo_costo ? `$${Number(producto.ultimo_costo).toFixed(2)}` : 'Sin compras'
    },
    {
      header: 'Stock Disponible',
      key: 'stock'
    },
    {
      header: 'Categoría',
      key: 'nombre_categoria'
    },
    {
      header: 'Estado',
      render: (producto) => (
        <span className={`status-pill status-${producto.estado}`}>
          {producto.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      render: (producto) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn-edit" 
            onClick={() => handleEditProducto(producto)}
            title="Editar producto"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Edit size={16} /> Editar
          </button>
          <button 
            className="btn-delete" 
            onClick={() => handleDeleteProducto(producto)}
            title="Desactivar producto"
            style={{
              background: 'none',
              border: '1px solid #dc3545',
              color: '#dc3545',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#dc3545';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#dc3545';
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="producto-container">
      <div className="producto-header">
        <h2>Gestión de Productos</h2>
        <button className="btn-add" onClick={handleAddProduct}>
          Agregar Producto
        </button>
      </div>

      <DataTable
        columns={columns}
        data={productos}
        loading={loading}
        emptyMessage="No hay productos en la base de datos."
        loadingMessage="Cargando productos..."
      />

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProducto ? 'Editar Producto' : 'Agregar Producto'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {categoriesLoading ? (
                <p>Cargando categorías...</p>
              ) : categorias.length === 0 ? (
                <div className="warning-box">
                  <p>No hay categorías creadas en la base de datos.</p>
                  <p>Debe crear una categoría antes de registrar un producto.</p>
                  <div className="modal-footer">
                    <button className="btn-cancel" type="button" onClick={handleCloseModal}>Cerrar</button>
                  </div>
                </div>
              ) : (
                <form className="producto-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" required defaultValue={editingProducto?.nombre || ''} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea id="descripcion" name="descripcion" rows="4" defaultValue={editingProducto?.descripcion || ''}></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="margen_ganancia">Margen de Ganancia (%):</label>
                    <input
                      type="number"
                      id="margen_ganancia"
                      name="margen_ganancia"
                      step="0.01"
                      placeholder="0.00"
                      required
                      defaultValue={editingProducto?.margen_ganancia ?? ''}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="id_categoria">Categoría:</label>
                    <select id="id_categoria" name="id_categoria" required defaultValue={editingProducto?.id_categoria || ''}>
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                  {!editingProducto && (
                    <div className="form-group">
                      <label htmlFor="imagenes">Imágenes del producto:</label>
                      <input
                        type="file"
                        id="imagenes"
                        name="imagenes"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                      <p className="image-help">Selecciona 5 imágenes para este producto.</p>
                      {selectedImages.length > 0 && (
                        <div className="selected-images">
                          <h4>Imágenes seleccionadas ({selectedImages.length})</h4>
                          <div className="image-list">
                            {selectedImages.map((file, index) => (
                              <div key={index} className="image-item">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Imagen ${index + 1}`}
                                  className="image-preview"
                                />
                                <button
                                  type="button"
                                  className="btn-remove-image"
                                  onClick={() => removeImage(index)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="modal-footer">
                    <button className="btn-cancel" type="button" onClick={handleCloseModal}>Cancelar</button>
                    <button className="btn-save" type="submit">{editingProducto ? 'Actualizar' : 'Guardar'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Producto;
