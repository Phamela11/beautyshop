import { useState, useEffect } from 'react';
import './Inventario.css';
import { useInventario } from '../../hooks/useInventario';
import DataTable from '../../components/global/DataTable';

const Inventario = () => {
  const [filtroProducto, setFiltroProducto] = useState('');
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processedMovimientos, setProcessedMovimientos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const {
    lotes,
    movimientos,
    loading,
    loadLotesInventario,
    loadLotesProducto,
    loadMovimientosInventario,
    loadMovimientosProducto
  } = useInventario();

  useEffect(() => {
    loadLotesInventario();
    loadMovimientosInventario();
  }, [loadLotesInventario, loadMovimientosInventario]);

  const getPedidoIdFromMovimiento = (mov) => {
    if (mov.id_pedido) return mov.id_pedido;
    const match = mov.descripcion?.match(/Venta pedido #(\d+)/i);
    return match ? Number(match[1]) : null;
  };

  useEffect(() => {
    const grouped = [];
    const salidaGroups = {};
    movimientos.forEach((mov, index) => {
      const pedidoId = getPedidoIdFromMovimiento(mov);
      if (mov.tipo === 'salida' && pedidoId) {
        const key = `pedido-${pedidoId}`;
        if (!salidaGroups[key]) {
          salidaGroups[key] = {
            id_movimiento: key,
            id_pedido: pedidoId,
            tipo: 'salida',
            cantidad: 0,
            precio_compra: 0,
            nombre_producto: `Pedido #${pedidoId}`,
            fecha: mov.fecha,
            descripcion: `Salida por pedido #${pedidoId}`,
            detalles: [],
            orden: new Date(mov.fecha).getTime() || index
          };
        }
        salidaGroups[key].cantidad += Number(mov.cantidad);
        salidaGroups[key].precio_compra += Number(mov.precio_compra) * Number(mov.cantidad);
        salidaGroups[key].detalles.push(mov);
        salidaGroups[key].orden = Math.min(salidaGroups[key].orden, new Date(mov.fecha).getTime() || index);
      } else {
        grouped.push({ ...mov, orden: new Date(mov.fecha).getTime() || index });
      }
    });
    Object.values(salidaGroups).forEach(group => {
      if (group.cantidad > 0) {
        group.precio_compra = group.precio_compra / group.cantidad;
      }
      grouped.push(group);
    });
    grouped.sort((a, b) => b.orden - a.orden);
    setProcessedMovimientos(grouped);
    setCurrentPage(1);
  }, [movimientos]);

  const totalPages = Math.max(1, Math.ceil(processedMovimientos.length / rowsPerPage));
  const pagedMovimientos = processedMovimientos.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleFiltroProducto = (e) => {
    const idProducto = e.target.value;
    setFiltroProducto(idProducto);
    if (idProducto) {
      loadLotesProducto(idProducto);
      loadMovimientosProducto(idProducto);
    } else {
      loadLotesInventario();
      loadMovimientosInventario();
    }
  };

  const openMovimientoModal = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovimiento(null);
  };

  const columns = [
    {
      header: 'Producto',
      key: 'nombre_producto'
    },
    {
      header: 'Cantidad Original',
      key: 'cantidad'
    },
    {
      header: 'Cantidad Disponible',
      key: 'cantidad_disponible'
    },
    {
      header: 'Precio Compra',
      render: (lote) => `$${parseFloat(lote.precio_compra).toFixed(2)}`
    },
    {
      header: 'Fecha Ingreso',
      render: (lote) => new Date(lote.fecha_ingreso).toLocaleDateString('es-ES')
    },
    {
      header: 'Proveedor',
      key: 'nombre_proveedor'
    }
  ];

  const getPrecioVenta = (mov) => {
    if (mov.precio_venta) {
      return Number(mov.precio_venta);
    }
    if (mov.precio_compra && mov.margen_ganancia_producto != null) {
      return Number(mov.precio_compra) * (1 + Number(mov.margen_ganancia_producto) / 100);
    }
    return Number(mov.precio_compra || 0);
  };

  const getValorTotal = (mov) => {
    if (mov.detalles) {
      return mov.detalles.reduce((sum, d) => sum + (getPrecioVenta(d) * Number(d.cantidad)), 0);
    }
    const unitPrice = mov.tipo === 'entrada'
      ? Number(mov.precio_compra || 0)
      : getPrecioVenta(mov);
    return mov.cantidad * unitPrice;
  };

  const movimientoColumns = [
    {
      header: 'Producto',
      key: 'nombre_producto'
    },
    {
      header: 'Tipo',
      render: (mov) => mov.tipo === 'entrada' ? 'Entrada' : 'Salida'
    },
    {
      header: 'Cantidad',
      key: 'cantidad'
    },
    {
      header: 'Valor total',
      render: (mov) => `$${getValorTotal(mov).toFixed(2)}`
    },
    {
      header: 'Fecha Movimiento',
      render: (mov) => new Date(mov.fecha).toLocaleDateString('es-ES')
    },
    {
      header: 'Detalle',
      key: 'descripcion'
    },
    {
      header: 'Acción',
      render: (mov) => (
        <button className="movimiento-info-btn" onClick={() => openMovimientoModal(mov)}>
          Ver detalle
        </button>
      )
    }
  ];

  // Obtener productos únicos para el filtro (id + nombre)
  const productosUnicos = Array.from(
    new Map(lotes.map((lote) => [lote.id_producto, lote.nombre_producto])).entries(),
    ([id, nombre]) => ({ id, nombre })
  );

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <h2>Lotes de Inventario (FIFO)</h2>
        <div className="filtro-container">
          <label htmlFor="filtro-producto">Filtrar por producto:</label>
          <select
            id="filtro-producto"
            value={filtroProducto}
            onChange={handleFiltroProducto}
          >
            <option value="">Todos los productos</option>
            {productosUnicos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={lotes}
        loading={loading}
        emptyMessage="No hay lotes en el inventario."
        loadingMessage="Cargando lotes de inventario..."
      />

      <div className="movimientos-section">
        <h3>Movimientos de Inventario (FIFO)</h3>
        <DataTable
          columns={movimientoColumns}
          data={pagedMovimientos}
          loading={loading}
          emptyMessage="No hay movimientos de inventario."
          loadingMessage="Cargando movimientos..."
        />
        {processedMovimientos.length > rowsPerPage && (
          <div className="pagination-container">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {showModal && selectedMovimiento && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="movimiento-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Detalle del movimiento</h4>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              {selectedMovimiento.detalles ? (
                <>
                  <p><strong>Pedido:</strong> #{selectedMovimiento.id_pedido}</p>
                  <p><strong>Tipo:</strong> Salida</p>
                  <p><strong>Cantidad Total:</strong> {selectedMovimiento.cantidad}</p>
                  <p><strong>Valor total:</strong> {`$${getValorTotal(selectedMovimiento).toFixed(2)}`}</p>
                  <p><strong>Fecha del movimiento:</strong> {new Date(selectedMovimiento.fecha).toLocaleDateString('es-ES')}</p>
                  <hr />
                  <h5>Detalles por producto:</h5>
                  {selectedMovimiento.detalles.map((detalle, index) => (
                    <div key={index} className="detalle-item">
                      <p><strong>Producto:</strong> {detalle.nombre_producto}</p>
                      <p><strong>Cantidad:</strong> {detalle.cantidad}</p>
                      <p><strong>Precio de compra:</strong> {detalle.precio_compra ? `$${Number(detalle.precio_compra).toFixed(2)}` : 'N/A'}</p>
                      <p><strong>Precio de venta:</strong> {getPrecioVenta(detalle) > 0 ? `$${getPrecioVenta(detalle).toFixed(2)}` : 'N/A'}</p>
                      <p><strong>Lote consumido:</strong> {detalle.id_detalle_compra || 'N/A'}</p>
                      <p><strong>Proveedor:</strong> {detalle.nombre_proveedor || 'N/A'}</p>
                      <p><strong>Descripción:</strong> {detalle.descripcion || '-'}</p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p><strong>Producto:</strong> {selectedMovimiento.nombre_producto}</p>
                  <p><strong>Tipo:</strong> {selectedMovimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}</p>
                  <p><strong>Cantidad:</strong> {selectedMovimiento.cantidad}</p>
                  <p><strong>Valor total:</strong> {`$${getValorTotal(selectedMovimiento).toFixed(2)}`}</p>
                  <hr />
                  <p><strong>Detalles del lote FIFO</strong></p>
                  <p><strong>Lote consumido:</strong> {selectedMovimiento.id_detalle_compra || 'N/A'}</p>
                  <p><strong>Precio de compra:</strong> {selectedMovimiento.precio_compra ? `$${Number(selectedMovimiento.precio_compra).toFixed(2)}` : 'N/A'}</p>
                  <p><strong>Fecha del lote:</strong> {selectedMovimiento.fecha_lote ? new Date(selectedMovimiento.fecha_lote).toLocaleDateString('es-ES') : 'N/A'}</p>
                  <p><strong>Proveedor:</strong> {selectedMovimiento.nombre_proveedor || 'N/A'}</p>
                  <p><strong>Precio de venta:</strong> {getPrecioVenta(selectedMovimiento) > 0 ? `$${getPrecioVenta(selectedMovimiento).toFixed(2)}` : 'N/A'}</p>
                  <p><strong>Ganancia unitaria:</strong> {selectedMovimiento.precio_compra && getPrecioVenta(selectedMovimiento) > 0
                    ? `$${(getPrecioVenta(selectedMovimiento) - Number(selectedMovimiento.precio_compra)).toFixed(2)}`
                    : 'N/A'
                  }</p>
                  <p><strong>Descripción:</strong> {selectedMovimiento.descripcion || '-'}</p>
                  <p><strong>Fecha del movimiento:</strong> {new Date(selectedMovimiento.fecha).toLocaleDateString('es-ES')}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="inventario-info">
        <p><strong>Total de lotes:</strong> {lotes.length}</p>
        <p><strong>Stock total disponible:</strong> {lotes.reduce((sum, lote) => sum + lote.cantidad_disponible, 0)}</p>
      </div>
    </div>
  );
};

export default Inventario;
