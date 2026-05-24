import { useState, useEffect } from 'react';
import './Reportes.css';

const API = "https://beautyshop-production.up.railway.app/api";
const fmt  = (n) => `$${Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtD = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—';
const pct  = (g, i) => i > 0 ? ((g / i) * 100).toFixed(1) + '%' : '—';

export default function Reportes() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [expandido, setExp]   = useState({});
  const [busqueda,  setBusqueda] = useState('');

  const today        = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(firstOfMonth);
  const [fechaFin,    setFechaFin]    = useState(today);

  const cargar = async () => {
    setLoading(true); setError(null); setExp({});
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.set('fecha_inicio', fechaInicio);
      if (fechaFin)    params.set('fecha_fin',    fechaFin);
      const res  = await fetch(`${API}/reportes/ganancias?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al cargar reporte');
      setData(json);
      setBusqueda('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const toggle = (id) => setExp(prev => ({ ...prev, [id]: !prev[id] }));

  // Productos filtrados por búsqueda
  const filtrados = (data?.productos || []).filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Resumen calculado SIEMPRE desde los productos filtrados
  // Así las tarjetas de arriba reflejan exactamente lo que se muestra abajo
  const resumen = {
    total_ingreso:   filtrados.reduce((a, p) => a + p.total_ingreso,  0),
    total_costo:     filtrados.reduce((a, p) => a + p.total_costo,    0),
    total_ganancia:  filtrados.reduce((a, p) => a + p.total_ganancia, 0),
    total_vendido:   filtrados.reduce((a, p) => a + p.total_vendido,  0),
    total_productos: filtrados.length,
  };

  return (
    <div className="rep-root">
      <div className="rep-header">
        <div>
          <h2 className="rep-title">Reportes</h2>
          <p className="rep-sub">Rentabilidad FIFO — ganancia real por cada lote de compra</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rep-filters">
        <div className="rep-filter-group">
          <label className="rep-label">Desde</label>
          <input type="date" className="rep-input" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </div>
        <div className="rep-filter-group">
          <label className="rep-label">Hasta</label>
          <input type="date" className="rep-input" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </div>
        <div className="rep-filter-group rep-filter-grow">
          <label className="rep-label">Buscar producto</label>
          <input
            type="text" className="rep-input"
            placeholder="Nombre o categoría..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="rep-filter-group rep-filter-btn-wrap">
          <label className="rep-label">&nbsp;</label>
          <button className="rep-btn-apply" onClick={cargar} disabled={loading}>
            {loading ? 'Cargando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen — siempre reflejan los productos visibles */}
      {data && (
        <div className="rep-summary">
          {[
            { label: 'Ingresos totales',  value: fmt(resumen.total_ingreso),                           cls: 'green' },
            { label: 'Costos totales',    value: fmt(resumen.total_costo),                             cls: 'red'   },
            { label: 'Ganancia neta',     value: fmt(resumen.total_ganancia),                          cls: 'pink'  },
            { label: 'Margen promedio',   value: pct(resumen.total_ganancia, resumen.total_ingreso),   cls: 'blue'  },
            { label: 'Uds. vendidas',     value: resumen.total_vendido,                                cls: ''      },
            { label: 'Productos',         value: resumen.total_productos,                              cls: ''      },
          ].map(s => (
            <div className="rep-card" key={s.label}>
              <div className={`rep-card-value ${s.cls}`}>{s.value}</div>
              <div className="rep-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Período activo */}
      {data && (
        <div className="rep-periodo">
          Mostrando {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
          {fechaInicio && fechaFin ? ` · ${fmtD(fechaInicio)} — ${fmtD(fechaFin)}` : ''}
          {busqueda ? ` · Filtrado: "${busqueda}"` : ''}
        </div>
      )}

      {error   && <div className="rep-error">{error}</div>}
      {loading && <div className="rep-empty">Cargando reporte...</div>}
      {!loading && data && filtrados.length === 0 && (
        <div className="rep-empty">
          {busqueda ? `No hay productos que coincidan con "${busqueda}".` : 'No hay ventas en el período seleccionado.'}
        </div>
      )}

      {/* Productos */}
      {!loading && filtrados.map(prod => (
        <div className="rep-producto" key={prod.id_producto}>
          <div className="rep-prod-header" onClick={() => toggle(prod.id_producto)}>
            <div className="rep-prod-left">
              <div className="rep-prod-name">{prod.nombre}</div>
              <div className="rep-prod-cat">{prod.categoria} · Margen configurado: {prod.margen}%</div>
            </div>
            <div className="rep-prod-totals">
              <Stat label="Ingreso"     val={fmt(prod.total_ingreso)}                        cls="green" />
              <Stat label="Costo"       val={fmt(prod.total_costo)}                          cls="red"   />
              <Stat label="Ganancia"    val={fmt(prod.total_ganancia)}                       cls="pink"  />
              <Stat label="Margen real" val={pct(prod.total_ganancia, prod.total_ingreso)}   cls="blue"  />
              <Stat label="Uds."        val={prod.total_vendido}                             cls=""      />
            </div>
            <div className={`rep-chevron${expandido[prod.id_producto] ? ' open' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {expandido[prod.id_producto] && (
            <div className="rep-lotes">
              {prod.lotes.map((lote, li) => (
                <div className="rep-lote" key={lote.id_lote}>
                  <div className="rep-lote-header">
                    <span className="rep-lote-badge">Lote {li + 1}</span>
                    <span className="rep-lote-meta">
                      Comprado: <b>{fmtD(lote.fecha_compra)}</b> ·
                      Costo unit.: <b>{fmt(lote.costo_lote)}</b> ·
                      Cant. original: <b>{lote.cantidad_original}</b>
                    </span>
                    <span className="rep-lote-ganancia">
                      Ganancia: <b className="pink">{fmt(lote.total_ganancia)}</b>
                      <span className="rep-lote-pct">{pct(lote.total_ganancia, lote.total_ingreso)}</span>
                    </span>
                  </div>

                  <div className="rep-table-wrap">
                    <table className="rep-table">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Fecha venta</th>
                          <th>Cant.</th>
                          <th>Costo unit.</th>
                          <th>Precio venta</th>
                          <th>Costo total</th>
                          <th>Ingreso total</th>
                          <th>Ganancia</th>
                          <th>Margen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lote.ventas.map((v, vi) => (
                          <tr key={vi}>
                            <td className="rep-td-id">#{v.id_pedido}</td>
                            <td>{fmtD(v.fecha_venta)}</td>
                            <td>{v.cantidad}</td>
                            <td className="red">{fmt(v.costo_unitario)}</td>
                            <td className="green">{fmt(v.precio_venta)}</td>
                            <td className="red">{fmt(v.costo_total)}</td>
                            <td className="green">{fmt(v.ingreso_total)}</td>
                            <td className="pink fw">{fmt(v.ganancia)}</td>
                            <td className="blue fw">{pct(v.ganancia, v.ingreso_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="rep-tfoot">
                          <td colSpan="5">Subtotal lote</td>
                          <td className="red fw">{fmt(lote.total_costo)}</td>
                          <td className="green fw">{fmt(lote.total_ingreso)}</td>
                          <td className="pink fw">{fmt(lote.total_ganancia)}</td>
                          <td className="blue fw">{pct(lote.total_ganancia, lote.total_ingreso)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, val, cls }) {
  return (
    <div className="rep-prod-stat">
      <span className="rep-prod-stat-label">{label}</span>
      <span className={`rep-prod-stat-val ${cls}`}>{val}</span>
    </div>
  );
}
