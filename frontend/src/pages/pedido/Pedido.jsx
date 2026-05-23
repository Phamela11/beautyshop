import { useCallback, useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import './Pedido.css';

const API = 'http://localhost:3000/api';
const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;
const fmtDate = (d) => new Date(d).toLocaleString('es-CO', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

const ESTADOS = ['pendiente', 'enviado'];
const ESTADOS_CERRADOS = ['entregado'];

const estadoColor = {
  pendiente:  { bg: '#fff8e8', color: '#a07020', border: '#edd890' },
  enviado:    { bg: '#eaf2ff', color: '#2858a0', border: '#90b8f0' },
  /** Pedidos antiguos con estado ya no válido en UI */
  entregado:  { bg: '#f4f4f5', color: '#71717a', border: '#d4d4d8' },
};

const getEstadoVisual = (pedido) => (
  pedido?.estado_envio === 'entregado' ? 'entregado' : pedido?.estado
);

const Pedido = () => {
  const [pedidos, setPedidos]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [detalle, setDetalle]         = useState(null);
  const [cambiandoEstado, setCambiando] = useState(null);
  const [modalEstado, setModalEstado] = useState(null); // { pedido }

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getPedidos();
      setPedidos(data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPedidos();
  }, [loadPedidos]);

  const verDetalle = async (pedido) => {
    setDetalle({ loading: true, pedido });
    try {
      const res = await fetch(`${API}/pedidos/${pedido.id_pedido}`);
      const data = await res.json();
      setDetalle(data);
    } catch (err) {
      console.error(err);
      setDetalle(null);
    }
  };

  const cambiarEstado = async (id_pedido, estado) => {
    const pedidoActual = pedidos.find(p => p.id_pedido === id_pedido);
    if (getEstadoVisual(pedidoActual) === 'entregado') {
      alert('Un pedido entregado no puede volver a pendiente o enviado.');
      setModalEstado(null);
      return;
    }

    setCambiando(id_pedido);
    try {
      await productService.updateEstadoPedido(id_pedido, estado);
      await loadPedidos();
      setModalEstado(null);
      if (detalle && detalle.id_pedido === id_pedido) {
        setDetalle(prev => ({ ...prev, estado }));
      }
    } catch (err) {
      alert(err.message || 'Error al cambiar estado');
    } finally {
      setCambiando(null);
    }
  };

  const filtered = pedidos.filter(p => {
    const estadoVisual = getEstadoVisual(p);
    const matchSearch =
      String(p.id_pedido).includes(search) ||
      (p.nombre_usuario || '').toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || estadoVisual === filtroEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="pedido-container">
      {/* Header */}
      <div className="pedido-topbar">
        <div>
          <h2 className="pedido-title">Gestión de Pedidos</h2>
          <p className="pedido-subtitle">{pedidos.length} pedidos en total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="pedido-filters">
        <div className="pedido-search-wrap">
          <svg className="pedido-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="pedido-search"
            placeholder="Buscar por ID o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="pedido-estado-filters">
          {['todos', 'pendiente', 'enviado', 'entregado'].map(e => (
            <button
              key={e}
              className={`pedido-filter-btn${filtroEstado === e ? ' active' : ''}`}
              onClick={() => setFiltroEstado(e)}
            >
              {e === 'todos' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
              <span className="pedido-filter-count">
                {e === 'todos' ? pedidos.length : pedidos.filter(p => getEstadoVisual(p) === e).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="pedido-table-wrap">
        {loading ? (
          <div className="pedido-empty">Cargando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="pedido-empty">No se encontraron pedidos.</div>
        ) : (
          <table className="pedido-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const estadoVisual = getEstadoVisual(p);
                const ec = estadoColor[estadoVisual] || estadoColor.pendiente;
                return (
                  <tr key={p.id_pedido}>
                    <td className="pedido-td-id">#{p.id_pedido}</td>
                    <td className="pedido-td-cliente">
                      <div className="pedido-cliente-name">{p.nombre_usuario || 'Cliente'}</div>
                    </td>
                    <td className="pedido-td-fecha">{fmtDate(p.fecha)}</td>
                    <td>
                      <span className="pedido-estado-pill" style={{
                        background: ec.bg, color: ec.color, border: `1px solid ${ec.border}`
                      }}>
                        {estadoVisual}
                      </span>
                    </td>
                    <td className="pedido-td-total">{fmt(p.total)}</td>
                    <td className="pedido-td-acciones">
                      <button
                        className="pedido-btn-detail"
                        onClick={() => verDetalle(p)}
                        title="Ver detalle"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Ver
                      </button>
                      {!ESTADOS_CERRADOS.includes(estadoVisual) && (
                        <button
                          className="pedido-btn-estado"
                          onClick={() => setModalEstado(p)}
                          title="Cambiar estado"
                          disabled={cambiandoEstado === p.id_pedido}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                          </svg>
                          Estado
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Detalle */}
      {detalle && (
        <div className="pedido-modal-overlay" onClick={() => setDetalle(null)}>
          <div className="pedido-modal" onClick={e => e.stopPropagation()}>
            <div className="pedido-modal-header">
              <div>
                <h3 className="pedido-modal-title">Detalle del Pedido #{detalle.id_pedido}</h3>
                <p className="pedido-modal-sub">{fmtDate(detalle.fecha)}</p>
              </div>
              <button className="pedido-modal-close" onClick={() => setDetalle(null)}>×</button>
            </div>

            <div className="pedido-modal-body">
              {/* Info cliente */}
              <div className="pedido-modal-section">
                <div className="pedido-modal-section-title">Cliente</div>
                <div className="pedido-modal-info-row">
                  <span>{detalle.nombre_usuario || 'N/A'}</span>
                  <span style={{ color: '#9c7a85' }}>{detalle.correo}</span>
                </div>
              </div>

              {/* Estado */}
              <div className="pedido-modal-section">
                <div className="pedido-modal-section-title">Estado del pedido</div>
                <p style={{ fontSize: 12, color: '#9c7a85', marginBottom: 8 }}>
                  Pendiente / enviado (venta y despacho). La entrega final se gestiona en <strong>Envíos</strong>.
                </p>
                {(() => {
                  const ec = estadoColor[detalle.estado] || estadoColor.pendiente;
                  return (
                    <span className="pedido-estado-pill" style={{
                      background: ec.bg, color: ec.color, border: `1px solid ${ec.border}`
                    }}>
                      {detalle.estado}
                    </span>
                  );
                })()}
              </div>

              {/* Productos */}
              <div className="pedido-modal-section">
                <div className="pedido-modal-section-title">Productos</div>
                <table className="pedido-detalle-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detalle.detalles || []).map(d => (
                      <tr key={d.id_detalle}>
                        <td>{d.nombre_producto}</td>
                        <td>{d.cantidad}</td>
                        <td>{fmt(d.precio_unitario)}</td>
                        <td style={{ fontWeight: 600, color: '#c9536a' }}>{fmt(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pedido-modal-total">
                  Total: <strong>{fmt(detalle.total)}</strong>
                </div>
              </div>

              {/* Pago */}
              {detalle.pago && (
                <div className="pedido-modal-section">
                  <div className="pedido-modal-section-title">Pago</div>
                  <div className="pedido-modal-info-row">
                    <span>Método: {detalle.pago.metodo_pago}</span>
                    <span>Estado: {detalle.pago.estado_pago}</span>
                  </div>
                </div>
              )}

              {/* Envío */}
              {detalle.envio && (
                <div className="pedido-modal-section">
                  <div className="pedido-modal-section-title">Envío</div>
                  <div className="pedido-modal-info-row">
                    <span>{detalle.envio.direccion_envio}, {detalle.envio.ciudad}</span>
                    <span>Estado: {detalle.envio.estado_envio}</span>
                  </div>
                  {detalle.envio.numero_guia && (
                    <div style={{ fontSize: 12, color: '#9c7a85', marginTop: 4 }}>
                      Guía: {detalle.envio.numero_guia} — {detalle.envio.empresa_envio}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Estado */}
      {modalEstado && (
        <div className="pedido-modal-overlay" onClick={() => setModalEstado(null)}>
          <div className="pedido-modal pedido-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pedido-modal-header">
              <h3 className="pedido-modal-title">Cambiar estado — Pedido #{modalEstado.id_pedido}</h3>
              <button className="pedido-modal-close" onClick={() => setModalEstado(null)}>×</button>
            </div>
            <div className="pedido-modal-body">
              <p style={{ fontSize: 12, color: '#9c7a85', marginBottom: 10 }}>
                La entrega al cliente se confirma en <strong>Envíos</strong> (estado del envío), no aquí.
              </p>
              <p style={{ fontSize: 13, color: '#9c7a85', marginBottom: 16 }}>
                Estado actual: <strong style={{ color: '#1a1015' }}>{modalEstado.estado}</strong>
              </p>
              <div className="pedido-estado-options">
                {ESTADOS_CERRADOS.includes(getEstadoVisual(modalEstado)) ? (
                  <p style={{ fontSize: 13, color: '#9c7a85' }}>
                    Este pedido ya fue entregado y no puede volver a pendiente.
                  </p>
                ) : ESTADOS.map(e => {
                  const ec = estadoColor[e];
                  const esCurrent = modalEstado.estado === e;
                  return (
                    <button
                      key={e}
                      className={`pedido-estado-option${esCurrent ? ' current' : ''}`}
                      style={esCurrent ? { background: ec.bg, border: `1.5px solid ${ec.border}`, color: ec.color } : {}}
                      disabled={esCurrent || cambiandoEstado === modalEstado.id_pedido}
                      onClick={() => cambiarEstado(modalEstado.id_pedido, e)}
                    >
                      {esCurrent && '✓ '}
                      {e.charAt(0).toUpperCase() + e.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedido;
