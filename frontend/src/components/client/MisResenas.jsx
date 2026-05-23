import { useCallback, useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import './MisResenas.css';

const fmtFecha = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(d);
  }
};

const StarSvg = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={filled ? 'resenas-star-on' : 'resenas-star-off'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarsStatic = ({ value }) => (
  <div className="resenas-stars-static" aria-label={`${value} de 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <StarSvg key={i} filled={i <= value} />
    ))}
  </div>
);

const MisResenas = () => {
  const userId = localStorage.getItem('userId');
  const [tab, setTab] = useState('valorar');
  const [loading, setLoading] = useState(true);
  const [resenas, setResenas] = useState([]);
  const [porValorar, setPorValorar] = useState([]);
  const [modal, setModal] = useState(null);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const load = useCallback(async () => {
    if (!userId) {
      setResenas([]);
      setPorValorar([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await productService.getResenasUsuario(userId);
      setResenas(data.resenas || []);
      setPorValorar(data.porValorar || []);
    } catch (e) {
      console.error(e);
      setResenas([]);
      setPorValorar([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (row) => {
    setModal(row);
    setCalificacion(5);
    setComentario('');
    setErrorMsg('');
  };

  const closeModal = () => {
    if (sending) return;
    setModal(null);
  };

  const submitResena = async () => {
    if (!userId || !modal) return;
    setSending(true);
    setErrorMsg('');
    try {
      await productService.createResena({
        id_usuario: Number(userId),
        id_pedido: modal.id_pedido,
        id_producto: modal.id_producto,
        calificacion,
        comentario: comentario.trim() || null,
      });
      setModal(null);
      await load();
      setTab('hechas');
    } catch (e) {
      setErrorMsg(e.message || 'Error al guardar');
    } finally {
      setSending(false);
    }
  };

  if (!userId) {
    return (
      <div className="cliente-card resenas-wrap">
        <h3>Mis reseñas</h3>
        <p className="resenas-empty">Inicia sesión para ver y publicar reseñas.</p>
      </div>
    );
  }

  return (
    <div className="cliente-card resenas-wrap">
      <h3>Mis reseñas</h3>
      <p className="resenas-hint">
        Puedes valorar cada producto cuando el envío del pedido está <strong>entregado</strong> (módulo Envíos).
        Cada reseña queda ligada a tu usuario, al pedido y al producto, con calificación del 1 al 5
        y un comentario opcional.
      </p>

      <div className="resenas-tabs">
        <button
          type="button"
          className={`resenas-tab${tab === 'valorar' ? ' active' : ''}`}
          onClick={() => setTab('valorar')}
        >
          Por valorar
          <span className="resenas-badge">{porValorar.length}</span>
        </button>
        <button
          type="button"
          className={`resenas-tab${tab === 'hechas' ? ' active' : ''}`}
          onClick={() => setTab('hechas')}
        >
          Publicadas
          <span className="resenas-badge">{resenas.length}</span>
        </button>
      </div>

      {loading ? (
        <p className="resenas-empty">Cargando…</p>
      ) : tab === 'valorar' ? (
        porValorar.length === 0 ? (
          <p className="resenas-empty">
            Cuando el envío de un pedido esté en estado <strong>entregado</strong> (en la tienda, módulo Envíos),
            podrás valorar cada artículo aquí.
          </p>
        ) : (
          <div className="resenas-list">
            {porValorar.map((row) => (
              <div className="resenas-card" key={`${row.id_pedido}-${row.id_producto}`}>
                <div className="resenas-card-head">
                  <div>
                    <div className="resenas-product">{row.nombre_producto}</div>
                    <div className="resenas-meta">
                      Pedido #{row.id_pedido}
                      {' · '}
                      {fmtFecha(row.fecha_pedido)}
                      {Number(row.cantidad) > 1 ? ` · Cant.: ${row.cantidad}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cliente-primary-btn"
                    onClick={() => openModal(row)}
                  >
                    Valorar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : resenas.length === 0 ? (
        <p className="resenas-empty">Aún no has publicado reseñas.</p>
      ) : (
        <div className="resenas-list">
          {resenas.map((r) => (
            <div className="resenas-card" key={r.id_resena}>
              <div className="resenas-card-head">
                <div>
                  <div className="resenas-product">{r.nombre_producto}</div>
                  <div className="resenas-meta">
                    Pedido #{r.id_pedido}
                    {' · '}
                    {fmtFecha(r.fecha)}
                  </div>
                </div>
                <StarsStatic value={Number(r.calificacion) || 0} />
              </div>
              {r.comentario ? (
                <p className="resenas-comment">{r.comentario}</p>
              ) : (
                <p className="resenas-meta" style={{ marginTop: 6 }}>
                  Sin comentario
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="client-modal-overlay" onClick={closeModal} role="presentation">
          <div className="client-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="resenas-modal-title">Valorar producto</div>
            <div className="resenas-modal-sub">
              {modal.nombre_producto}
              <br />
              Pedido #{modal.id_pedido}
            </div>

            <div className="resenas-label">Calificación</div>
            <div className="resenas-stars-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCalificacion(n)}
                  aria-label={`${n} estrellas`}
                >
                  <StarSvg filled={n <= calificacion} />
                </button>
              ))}
            </div>

            <div className="resenas-label">Comentario (opcional)</div>
            <textarea
              className="resenas-textarea"
              placeholder="Cuéntanos tu experiencia con el producto…"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={2000}
            />

            {errorMsg && <div className="resenas-error">{errorMsg}</div>}

            <div className="resenas-modal-actions">
              <button type="button" className="resenas-btn-ghost" onClick={closeModal} disabled={sending}>
                Cancelar
              </button>
              <button type="button" className="cliente-primary-btn" onClick={submitResena} disabled={sending}>
                {sending ? 'Publicando…' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisResenas;
