import { useCallback, useEffect, useMemo, useState } from 'react';
import { productService } from '../../services/productService';
import { API_BASE, getAssetUrl } from '../../services/apiConfig';

/* ── Íconos inline ────────────────────────────────────────── */
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IconCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconCash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);
const IconTransfer = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const IconCheck = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconCart = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

/* ── Métodos de pago disponibles ──────────────────────────── */
const METODOS_PAGO = [
  { id: 'tarjeta_credito',  label: 'Tarjeta de crédito',  icon: <IconCard />,     desc: 'Visa, Mastercard, Amex' },
  { id: 'tarjeta_debito',   label: 'Tarjeta de débito',   icon: <IconCard />,     desc: 'Débito bancario' },
  { id: 'efectivo',         label: 'Efectivo',             icon: <IconCash />,     desc: 'Pago contra entrega' },
  { id: 'transferencia',    label: 'Transferencia',        icon: <IconTransfer />, desc: 'PSE / Transferencia bancaria' },
];

/* ── Componente principal ─────────────────────────────────── */
const Carrito = ({ onCompraRealizada, onGoPedidos }) => {
  const [carrito,      setCarrito]      = useState({ items: [], total_productos: 0 });
  const [loading,      setLoading]      = useState(true);
  const [showPagoModal,setShowPagoModal]= useState(false);
  const [metodoPago,   setMetodoPago]   = useState('');
  const [procesando,   setProcesando]   = useState(false);
  const [exito,        setExito]        = useState(false);
  const [pedidoId,     setPedidoId]     = useState(null);
  const [errorMsg,     setErrorMsg]     = useState('');

  // Obtener userId de forma robusta
  const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');

  const loadCarrito = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await productService.getCarrito(userId);
      setCarrito(data);
    } catch (error) {
      console.error('Error cargando carrito:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCarrito();
  }, [loadCarrito]);

  const totalProductos = useMemo(
    () => carrito.items.reduce((acc, item) => acc + Number(item.cantidad), 0),
    [carrito.items]
  );

  // Precio total estimado (el backend lo calcula con FIFO + margen)
  const totalEstimado = useMemo(() => {
    return carrito.items.reduce((acc, item) => {
      const precio = Number(item.precio_venta || item.precio || 0);
      return acc + precio * Number(item.cantidad);
    }, 0);
  }, [carrito.items]);

  const handleChangeCantidad = async (id_producto, cantidad) => {
    try {
      await productService.updateCarritoItem(userId, id_producto, cantidad);
      await loadCarrito();
      if (onCompraRealizada) onCompraRealizada();
    } catch (error) {
      alert(error.message || 'No se pudo actualizar el carrito');
    }
  };

  /* Abrir modal de pago */
  const handleAbrirPago = async () => {
    if (!userId) {
      setErrorMsg('No pudimos identificar tu usuario');
      return;
    }

    try {
      // Validar que el usuario tenga información completa
      const response = await fetch(`${API_BASE}/usuarios/${userId}`);
      if (!response.ok) {
        throw new Error('Error al validar información');
      }

      const usuario = await response.json();

      if (!usuario.nombre || !usuario.correo || !usuario.direccion) {
        alert('⚠️ Debes completar tu perfil antes de realizar un pedido.\n\nPor favor, completa tu información:\n- Nombre\n- Correo\n- Dirección\n\nVe a tu perfil para actualizar esta información.');
        return;
      }

      setMetodoPago('');
      setErrorMsg('');
      setExito(false);
      setShowPagoModal(true);
    } catch (error) {
      console.error('Error al validar usuario:', error);
      setErrorMsg('Error al validar tu información. Intenta de nuevo.');
    }
  };

  /* Confirmar pedido + pago */
  const handleConfirmarPedido = async () => {
    if (!metodoPago) {
      setErrorMsg('Por favor selecciona un método de pago.');
      return;
    }
    setErrorMsg('');
    setProcesando(true);
    try {
      // 1. Hacer checkout del carrito (crea el pedido con FIFO)
      const resultado = await productService.checkoutCarrito(userId);
      const idPedido = resultado.id_pedido;

      // 2. Registrar el pago
      await productService.registrarPago({
        id_pedido: idPedido,
        metodo_pago: metodoPago,
        estado_pago: 'completado',
      });

      setPedidoId(idPedido);
      setExito(true);
      await loadCarrito();
      if (onCompraRealizada) onCompraRealizada();
    } catch (error) {
      setErrorMsg(error.message || 'No se pudo realizar el pedido. Intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  const handleCerrarModal = () => {
    setShowPagoModal(false);
    if (exito && onGoPedidos) onGoPedidos();
  };

  if (loading) return (
    <div className="carrito-loading">
      <div className="carrito-loading-spinner" />
      <p>Cargando carrito...</p>
    </div>
  );

  return (
    <>
      {/* ── Vista del carrito ── */}
      <div className="carrito-wrapper">
        <div className="carrito-header-row">
          <h3 className="carrito-title">Mi carrito</h3>
          {totalProductos > 0 && (
            <span className="carrito-count-badge">{totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}</span>
          )}
        </div>

        {carrito.items.length === 0 ? (
          <div className="carrito-empty">
            <div className="carrito-empty-icon"><IconCart /></div>
            <p className="carrito-empty-title">Tu carrito está vacío</p>
            <p className="carrito-empty-sub">Agrega productos desde el catálogo para comenzar.</p>
          </div>
        ) : (
          <>
            <div className="carrito-items">
              {carrito.items.map((item) => {
                const precio = Number(item.precio_venta || item.precio || 0);
                return (
                  <div className="carrito-item" key={item.id_detalle}>
                    <div className="carrito-item-img">
                      {item.imagenes?.[0]
                        ? <img src={getAssetUrl(item.imagenes[0])} alt={item.nombre} />
                        : <div className="carrito-item-img-placeholder" />}
                    </div>
                    <div className="carrito-item-info">
                      <div className="carrito-item-name">{item.nombre}</div>
                      {precio > 0 && (
                        <div className="carrito-item-price">
                          ${(precio * item.cantidad).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </div>
                      )}
                    </div>
                    <div className="carrito-item-qty">
                      <button
                        className="carrito-qty-btn"
                        onClick={() => handleChangeCantidad(item.id_producto, Math.max(0, Number(item.cantidad) - 1))}
                      >−</button>
                      <span className="carrito-qty-val">{item.cantidad}</span>
                      <button
                        className="carrito-qty-btn"
                        onClick={() => handleChangeCantidad(item.id_producto, Number(item.cantidad) + 1)}
                      >+</button>
                      <button
                        className="carrito-qty-btn carrito-qty-delete"
                        onClick={() => handleChangeCantidad(item.id_producto, 0)}
                        title="Eliminar"
                      ><IconTrash /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="carrito-footer">
              <div className="carrito-footer-info">
                <span className="carrito-footer-label">Total de productos</span>
                <span className="carrito-footer-count">{totalProductos}</span>
              </div>
              {totalEstimado > 0 && (
                <div className="carrito-footer-info">
                  <span className="carrito-footer-label">Estimado</span>
                  <span className="carrito-footer-total">
                    ${totalEstimado.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              )}
              <button className="carrito-checkout-btn" onClick={handleAbrirPago}>
                Realizar pedido
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Modal de método de pago ── */}
      {showPagoModal && (
        <div className="pago-overlay" onClick={!procesando ? handleCerrarModal : undefined}>
          <div className="pago-modal" onClick={(e) => e.stopPropagation()}>

            {exito ? (
              /* ── Pantalla de éxito ── */
              <div className="pago-exito">
                <div className="pago-exito-icon"><IconCheck /></div>
                <h3 className="pago-exito-title">¡Pedido realizado!</h3>
                <p className="pago-exito-sub">
                  Tu pedido <strong>#{pedidoId}</strong> ha sido registrado con éxito.<br />
                  Método de pago: <strong>{METODOS_PAGO.find(m => m.id === metodoPago)?.label}</strong>
                </p>
                <button className="pago-confirm-btn" onClick={handleCerrarModal}>
                  Ver mis pedidos
                </button>
              </div>
            ) : (
              /* ── Selección de método ── */
              <>
                <div className="pago-modal-header">
                  <h3 className="pago-modal-title">Método de pago</h3>
                  <button className="pago-close-btn" onClick={handleCerrarModal} disabled={procesando}>✕</button>
                </div>

                <p className="pago-modal-sub">Selecciona cómo deseas pagar tu pedido</p>

                <div className="pago-metodos">
                  {METODOS_PAGO.map((m) => (
                    <button
                      key={m.id}
                      className={`pago-metodo-btn ${metodoPago === m.id ? 'pago-metodo-btn--active' : ''}`}
                      onClick={() => setMetodoPago(m.id)}
                    >
                      <span className="pago-metodo-icon">{m.icon}</span>
                      <span className="pago-metodo-info">
                        <span className="pago-metodo-label">{m.label}</span>
                        <span className="pago-metodo-desc">{m.desc}</span>
                      </span>
                      <span className="pago-metodo-radio">
                        {metodoPago === m.id && <span className="pago-metodo-radio-dot" />}
                      </span>
                    </button>
                  ))}
                </div>

                {errorMsg && <p className="pago-error">{errorMsg}</p>}

                <div className="pago-modal-footer">
                  <button className="pago-cancel-btn" onClick={handleCerrarModal} disabled={procesando}>
                    Cancelar
                  </button>
                  <button
                    className="pago-confirm-btn"
                    onClick={handleConfirmarPedido}
                    disabled={procesando || !metodoPago}
                  >
                    {procesando ? (
                      <><span className="pago-spinner" /> Procesando...</>
                    ) : (
                      'Confirmar pedido'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Estilos del carrito y modal ── */}
      <style>{`
        /* Carrito */
        .carrito-loading {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 48px; color: #9c7a85;
        }
        .carrito-loading-spinner {
          width: 28px; height: 28px; border: 3px solid #f0e0e5;
          border-top-color: #c9536a; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .carrito-wrapper {
          background: #fff; border: 1px solid #ece4e7;
          border-radius: 14px; overflow: hidden;
        }
        .carrito-header-row {
          display: flex; align-items: center; gap: 12px;
          padding: 20px 24px 16px; border-bottom: 1px solid #f5f0f2;
        }
        .carrito-title {
          font-size: 16px; font-weight: 600; color: #1a1015; margin: 0;
        }
        .carrito-count-badge {
          background: #fdf0f2; color: #c9536a;
          border: 1px solid #f0d0d8; border-radius: 20px;
          font-size: 11px; font-weight: 600; padding: 2px 10px;
        }
        .carrito-empty {
          padding: 56px 24px; text-align: center;
        }
        .carrito-empty-icon {
          width: 72px; height: 72px; background: #fdf0f2;
          border-radius: 18px; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 16px;
        }
        .carrito-empty-icon svg { stroke: #c9536a; }
        .carrito-empty-title {
          font-size: 15px; font-weight: 600; color: #1a1015; margin: 0 0 6px;
        }
        .carrito-empty-sub { font-size: 13px; color: #9c7a85; margin: 0; }

        .carrito-items { padding: 8px 16px; }
        .carrito-item {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid #f8f2f4;
        }
        .carrito-item:last-child { border-bottom: none; }
        .carrito-item-img {
          width: 54px; height: 54px; border-radius: 10px;
          background: #f5f0f2; flex-shrink: 0; overflow: hidden;
        }
        .carrito-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .carrito-item-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #f0e0e5, #f8edf0);
        }
        .carrito-item-info { flex: 1; min-width: 0; }
        .carrito-item-name {
          font-size: 13px; font-weight: 500; color: #1a1015;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .carrito-item-price {
          font-size: 13px; font-weight: 600; color: #c9536a; margin-top: 3px;
        }
        .carrito-item-qty {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .carrito-qty-btn {
          width: 30px; height: 30px; border-radius: 8px;
          border: 1px solid #ece4e7; background: #fff;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; font-size: 16px; color: #5a3a44;
          transition: all 0.15s; font-weight: 500;
        }
        .carrito-qty-btn:hover { background: #fdf0f2; border-color: #c9536a; color: #c9536a; }
        .carrito-qty-delete:hover { background: #fff0f0; border-color: #e05a6a; color: #e05a6a; }
        .carrito-qty-val {
          min-width: 28px; text-align: center;
          font-size: 14px; font-weight: 600; color: #1a1015;
        }

        .carrito-footer {
          padding: 16px 24px; background: #fdf8f9;
          border-top: 1px solid #f0e7ea;
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .carrito-footer-info { display: flex; flex-direction: column; gap: 2px; }
        .carrito-footer-label { font-size: 10px; color: #9c7a85; text-transform: uppercase; letter-spacing: 0.1em; }
        .carrito-footer-count { font-size: 18px; font-weight: 700; color: #1a1015; }
        .carrito-footer-total { font-size: 18px; font-weight: 700; color: #c9536a; }
        .carrito-checkout-btn {
          margin-left: auto; background: linear-gradient(135deg, #c9536a, #a03d52);
          color: #fff; border: none; border-radius: 10px;
          padding: 12px 28px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 4px 14px rgba(201,83,106,0.3);
        }
        .carrito-checkout-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .carrito-checkout-btn:active { transform: translateY(0); }

        /* Modal overlay */
        .pago-overlay {
          position: fixed; inset: 0;
          background: rgba(26,16,21,0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .pago-modal {
          background: #fff; border-radius: 16px;
          width: min(480px, 100%);
          border: 1px solid #ece4e7;
          box-shadow: 0 24px 64px rgba(26,16,21,0.18);
          animation: slideUp 0.25s ease;
          overflow: hidden;
        }
        .pago-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px 12px;
        }
        .pago-modal-title {
          font-size: 17px; font-weight: 700; color: #1a1015; margin: 0;
        }
        .pago-close-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid #ece4e7;
          background: #fdf8f9; cursor: pointer; font-size: 14px; color: #9c7a85;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .pago-close-btn:hover { background: #fdf0f2; color: #c9536a; border-color: #f0c8d0; }
        .pago-modal-sub {
          font-size: 13px; color: #9c7a85; padding: 0 24px 16px; margin: 0;
        }

        /* Métodos */
        .pago-metodos { display: flex; flex-direction: column; gap: 8px; padding: 0 16px; }
        .pago-metodo-btn {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-radius: 10px;
          border: 1.5px solid #ece4e7; background: #fff;
          cursor: pointer; text-align: left; font-family: inherit;
          transition: all 0.15s; width: 100%;
        }
        .pago-metodo-btn:hover { border-color: #e8849a; background: #fdf8f9; }
        .pago-metodo-btn--active {
          border-color: #c9536a; background: #fdf0f2;
        }
        .pago-metodo-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #f5f0f2; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; color: #c9536a;
        }
        .pago-metodo-btn--active .pago-metodo-icon { background: #f0c8d0; }
        .pago-metodo-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .pago-metodo-label { font-size: 14px; font-weight: 600; color: #1a1015; }
        .pago-metodo-desc { font-size: 11px; color: #9c7a85; }
        .pago-metodo-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #ddd; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; transition: border-color 0.15s;
        }
        .pago-metodo-btn--active .pago-metodo-radio { border-color: #c9536a; }
        .pago-metodo-radio-dot {
          width: 10px; height: 10px; border-radius: 50%; background: #c9536a;
        }

        /* Error */
        .pago-error {
          margin: 10px 16px 0; padding: 10px 14px;
          background: #fff0f0; border: 1px solid #f0c8c8;
          border-radius: 8px; color: #c03040; font-size: 13px;
        }

        /* Footer del modal */
        .pago-modal-footer {
          display: flex; gap: 10px; padding: 16px 16px 20px;
          margin-top: 12px;
        }
        .pago-cancel-btn {
          flex: 1; padding: 12px; border-radius: 10px;
          border: 1.5px solid #ece4e7; background: #fff;
          color: #5a3a44; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .pago-cancel-btn:hover { background: #fdf8f9; border-color: #ddd; }
        .pago-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pago-confirm-btn {
          flex: 2; padding: 12px; border-radius: 10px;
          border: none; background: linear-gradient(135deg, #c9536a, #a03d52);
          color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: opacity 0.15s; display: flex;
          align-items: center; justify-content: center; gap: 8px;
        }
        .pago-confirm-btn:hover { opacity: 0.9; }
        .pago-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Spinner */
        .pago-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite; display: inline-block;
        }

        /* Pantalla de éxito */
        .pago-exito {
          padding: 40px 28px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .pago-exito-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #c9536a, #a03d52);
          display: flex; align-items: center; justify-content: center;
          color: #fff; margin-bottom: 4px;
          box-shadow: 0 8px 24px rgba(201,83,106,0.35);
        }
        .pago-exito-title {
          font-size: 20px; font-weight: 700; color: #1a1015; margin: 0;
        }
        .pago-exito-sub {
          font-size: 13px; color: #9c7a85; margin: 0; line-height: 1.6;
        }
        .pago-exito .pago-confirm-btn {
          flex: none; width: 100%; margin-top: 8px; padding: 13px;
        }

        /* Animaciones */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default Carrito;
