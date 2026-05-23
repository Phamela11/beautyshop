import { useState, useEffect } from 'react';
import './Compra.css';
import { useCompra } from '../../hooks/useCompra';
import { productService } from '../../services/productService';
import DataTable from '../../components/global/DataTable';

const Compra = () => {
  const [showModal, setShowModal] = useState(false);
  const [detalleCompra, setDetalleCompra] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [detalleError, setDetalleError] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedProveedor, setSelectedProveedor] = useState('');
  const [detalles, setDetalles] = useState([]);
  const [nuevoDetalle, setNuevoDetalle] = useState({
    id_producto: '',
    cantidad: '',
    precio_compra: ''
  });

  const { compras, loading, loadCompras, createCompra, deleteCompra } = useCompra();

  const formatMoney = (value) =>
    `$${Number(value || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) : '-';

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingData(true);
      try {
        const [prov, prod] = await Promise.all([
          productService.getProveedores(),
          productService.getProducts()
        ]);
        setProveedores(prov);
        setProductos(prod);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingData(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    loadCompras();
  }, [loadCompras]);

  const handleAddCompra = () => {
    setSelectedProveedor('');
    setDetalles([]);
    setNuevoDetalle({ id_producto: '', cantidad: '', precio_compra: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProveedor('');
    setDetalles([]);
    setNuevoDetalle({ id_producto: '', cantidad: '', precio_compra: '' });
  };

  const handleAgregarDetalle = () => {
    if (!nuevoDetalle.id_producto || !nuevoDetalle.cantidad || !nuevoDetalle.precio_compra) {
      alert('Por favor completa todos los campos del producto');
      return;
    }

    const producto = productos.find(p => p.id_producto == nuevoDetalle.id_producto);
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

    setDetalles([
      ...detalles,
      {
        id_producto: parseInt(nuevoDetalle.id_producto),
        cantidad: parseInt(nuevoDetalle.cantidad),
        precio_compra: parseFloat(nuevoDetalle.precio_compra),
        nombre_producto: producto.nombre
      }
    ]);

    setNuevoDetalle({ id_producto: '', cantidad: '', precio_compra: '' });
  };

  const handleRemoverDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_compra), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProveedor || detalles.length === 0) {
      alert('Selecciona un proveedor y agrega al menos un producto');
      return;
    }

    try {
      const compraData = {
        id_proveedor: parseInt(selectedProveedor),
        detalles: detalles.map(d => ({
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_compra: d.precio_compra
        }))
      };

      const result = await createCompra(compraData);
      if (result.success) {
        alert('Compra creada exitosamente');
        handleCloseModal();
      } else {
        alert(result.error || 'Error al crear compra');
      }
    } catch (error) {
      console.error('Error al guardar compra:', error);
      alert(error.message || 'Error al guardar compra');
    }
  };

  const handleDeleteCompra = async (compra) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la compra #${compra.id_compra}?`)) {
      return;
    }

    try {
      const result = await deleteCompra(compra.id_compra);
      if (result.success) {
        alert('Compra eliminada exitosamente');
      } else {
        alert('Error al eliminar compra');
      }
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      alert(error.message || 'Error al eliminar compra');
    }
  };

  const handleVerDetalle = async (compra) => {
    setDetalleError('');
    setLoadingDetalle(true);
    setDetalleCompra({
      ...compra,
      detalles: [],
      loading: true,
    });

    try {
      const data = await productService.getCompra(compra.id_compra);
      setDetalleCompra(data);
    } catch (error) {
      console.error('Error al cargar detalle de compra:', error);
      setDetalleError(error.message || 'No se pudo cargar el detalle de la compra');
      setDetalleCompra(compra);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleCerrarDetalle = () => {
    setDetalleCompra(null);
    setDetalleError('');
    setLoadingDetalle(false);
  };

  const columns = [
    {
      header: 'ID Compra',
      key: 'id_compra'
    },
    {
      header: 'Proveedor',
      key: 'nombre_proveedor'
    },
    {
      header: 'Fecha',
      render: (compra) => formatDate(compra.fecha)
    },
    {
      header: 'Productos',
      render: (compra) => compra.productos_compra || 'Sin productos'
    },
    {
      header: 'Total',
      render: (compra) => formatMoney(compra.total)
    },
    {
      header: 'Acciones',
      render: (compra) => (
        <div className="compra-actions">
          <button className="btn-detail" onClick={() => handleVerDetalle(compra)}>Ver detalles</button>
          <button className="btn-delete" onClick={() => handleDeleteCompra(compra)}>Eliminar</button>
        </div>
      )
    }
  ];

  return (
    <div className="compra-container">
      <div className="compra-header">
        <h2>Gestión de Compras</h2>
        <button className="btn-add" onClick={handleAddCompra}>
          Agregar Compra
        </button>
      </div>

      <DataTable
        columns={columns}
        data={compras}
        loading={loading}
        emptyMessage="No hay compras en la base de datos."
        loadingMessage="Cargando compras..."
      />

      {detalleCompra && (
        <div className="modal-overlay" onClick={handleCerrarDetalle}>
          <div className="modal-content compra-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Detalle de Compra #{detalleCompra.id_compra}</h3>
                <p className="compra-detail-subtitle">{formatDate(detalleCompra.fecha)}</p>
              </div>
              <button className="modal-close" onClick={handleCerrarDetalle}>×</button>
            </div>

            <div className="modal-body">
              <div className="compra-detail-summary">
                <div>
                  <span>Proveedor</span>
                  <strong>{detalleCompra.nombre_proveedor || 'Sin proveedor'}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatMoney(detalleCompra.total)}</strong>
                </div>
                <div>
                  <span>Productos</span>
                  <strong>{detalleCompra.detalles?.length || 0}</strong>
                </div>
              </div>

              {detalleError && (
                <div className="compra-detail-error">{detalleError}</div>
              )}

              {loadingDetalle ? (
                <div className="compra-detail-empty">Cargando detalle...</div>
              ) : !detalleCompra.detalles || detalleCompra.detalles.length === 0 ? (
                <div className="compra-detail-empty">Esta compra no tiene productos registrados.</div>
              ) : (
                <table className="detalles-table compra-detail-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio compra</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleCompra.detalles.map((detalle) => (
                      <tr key={detalle.id_detalle}>
                        <td>{detalle.nombre_producto || `Producto #${detalle.id_producto}`}</td>
                        <td>{detalle.cantidad}</td>
                        <td>{formatMoney(detalle.precio_compra)}</td>
                        <td>{formatMoney(detalle.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nueva Compra</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <form className="compra-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="proveedor">Seleccionar Proveedor:</label>
                  <select
                    id="proveedor"
                    value={selectedProveedor}
                    onChange={(e) => setSelectedProveedor(e.target.value)}
                    disabled={loadingData}
                  >
                    <option value="">-- Selecciona un proveedor --</option>
                    {proveedores.map(p => (
                      <option key={p.id_proveedor} value={p.id_proveedor}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="detalle-section">
                  <h4>Agregar Productos</h4>
                  <div className="detalle-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="producto">Producto:</label>
                        <select
                          id="producto"
                          value={nuevoDetalle.id_producto}
                          onChange={(e) => setNuevoDetalle({...nuevoDetalle, id_producto: e.target.value})}
                          disabled={loadingData}
                        >
                          <option value="">-- Selecciona un producto --</option>
                          {productos.map(p => (
                            <option key={p.id_producto} value={p.id_producto}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cantidad">Cantidad:</label>
                        <input
                          type="number"
                          id="cantidad"
                          value={nuevoDetalle.cantidad}
                          onChange={(e) => setNuevoDetalle({...nuevoDetalle, cantidad: e.target.value})}
                          placeholder="0"
                          min="1"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="precio">Precio Compra:</label>
                        <input
                          type="number"
                          id="precio"
                          value={nuevoDetalle.precio_compra}
                          onChange={(e) => setNuevoDetalle({...nuevoDetalle, precio_compra: e.target.value})}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <button type="button" className="btn-add-item" onClick={handleAgregarDetalle}>
                        Agregar
                      </button>
                    </div>
                  </div>

                  {detalles.length > 0 && (
                    <div className="detalles-lista">
                      <h5>Productos en la compra:</h5>
                      <table className="detalles-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalles.map((d, index) => (
                            <tr key={index}>
                              <td>{d.nombre_producto}</td>
                              <td>{d.cantidad}</td>
                              <td>${d.precio_compra.toFixed(2)}</td>
                              <td>${(d.cantidad * d.precio_compra).toFixed(2)}</td>
                              <td>
                                <button type="button" className="btn-delete-item" onClick={() => handleRemoverDetalle(index)}>
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="total-section">
                        <strong>Total: ${calcularTotal()}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" type="button" onClick={handleCloseModal}>Cancelar</button>
                  <button className="btn-save" type="submit" disabled={detalles.length === 0}>
                    Guardar Compra
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

export default Compra;
