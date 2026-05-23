import '../pedido/Pedido.css';
import './envio.css';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Search, Eye, Truck } from 'lucide-react';

const API = 'http://localhost:3000/api';
const fmt  = (n) => `$${Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
const fmtD = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—';

const estadoConfig = {
  'en camino': { label:'En camino', bg:'#eaf2ff', color:'#2858a0', border:'#90b8f0' },
  entregado:   { label:'Entregado', bg:'#eaf8ee', color:'#207048', border:'#90d8a8' },
};
const FILTROS_ESTADO = [
  { key:'todos',     label:'Todos'     },
  { key:'en camino', label:'En camino' },
  { key:'entregado', label:'Entregado' },
];

const normalizarTexto = (value) => String(value || '').trim();

export default function Envios() {
  const [tab, setTab] = useState('lista'); // 'lista' | 'reporte'

  // ── Lista state ──
  const [envios,       setEnvios]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [ciudadFiltro, setCiudadFiltro] = useState('todas');
  const [selected,     setSelected]     = useState(null);
  const [logEmpresa,   setLogEmpresa]   = useState('');
  const [logGuia,      setLogGuia]      = useState('');
  const [logCiudad,    setLogCiudad]    = useState('');
  const [logSaving,    setLogSaving]    = useState(false);
  const [logErr,       setLogErr]       = useState('');
  const [savingId,     setSavingId]     = useState(null);
  const [estadoErr,    setEstadoErr]    = useState('');

  // ── Reporte state ──
  const [repData,    setRepData]    = useState(null);
  const [repLoading, setRepLoading] = useState(false);
  const [repError,   setRepError]   = useState(null);
  const today        = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fechaInicio,  setFechaInicio]  = useState(firstOfMonth);
  const [fechaFin,     setFechaFin]     = useState(today);
  const [estadoRep,    setEstadoRep]    = useState('');

  const obtenerEnvios = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res  = await fetch(`${API}/envios`);
      const data = await res.json();
      const nextEnvios = Array.isArray(data) ? data : [];
      setEnvios(nextEnvios);
      setSelected(current => {
        if (!current) return current;
        return nextEnvios.find(e => e.id_envio === current.id_envio) || current;
      });
    } catch {
      if (!silent) setEnvios([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const cargarReporte = useCallback(async () => {
    setRepLoading(true); setRepError(null);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.set('fecha_inicio', fechaInicio);
      if (fechaFin)    params.set('fecha_fin',    fechaFin);
      if (estadoRep)   params.set('estado',       estadoRep);
      const res  = await fetch(`${API}/reportes/envios?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      setRepData(json);
    } catch (err) { setRepError(err.message); } finally { setRepLoading(false); }
  }, [estadoRep, fechaFin, fechaInicio]);

  useEffect(() => {
    if (!selected) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogEmpresa(normalizarTexto(selected.empresa_envio));
    setLogGuia(normalizarTexto(selected.guia));
    setLogCiudad(normalizarTexto(selected.ciudad_envio));
    setLogErr('');
  }, [selected]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    obtenerEnvios();
  }, [obtenerEnvios]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === 'reporte' && !repData) cargarReporte();
  }, [cargarReporte, repData, tab]);

  const cambiarEstado = async (envio, nuevoEstado) => {
    setEstadoErr('');

    if (nuevoEstado === 'entregado') {
      const transportadora = normalizarTexto(envio.empresa_envio || envio.transportadora);
      if (!transportadora || transportadora.toLowerCase() === 'sin asignar') {
        setEstadoErr('Debes asignar una transportadora antes de marcar el envio como entregado.');
        return;
      }
    }

    setSavingId(envio.id_envio);
    try {
      const res  = await fetch(`${API}/envios/${envio.id_envio}/estado`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo actualizar el estado del envio.');

      setEnvios(prev => prev.map(e =>
        e.id_envio === envio.id_envio ? {...e, estado: nuevoEstado} : e
      ));
      setSelected(current => current?.id_envio === envio.id_envio ? {...current, estado: nuevoEstado} : current);
      await obtenerEnvios({ silent: true });
    } catch(e) {
      setEstadoErr(e.message || 'No se pudo actualizar el estado del envio.');
    } finally {
      setSavingId(null);
    }
  };

  const guardarLogistica = async () => {
    if (!selected) return;
    setLogSaving(true); setLogErr('');
    try {
      const res  = await fetch(`${API}/envios/${selected.id_envio}/logistica`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ empresa_envio: logEmpresa.trim()||null, numero_guia: logGuia.trim()||null, ciudad: logCiudad.trim()||null }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo guardar');
      const emp=logEmpresa.trim(), gu=logGuia.trim(), ci=logCiudad.trim();
      setEnvios(prev => prev.map(e => e.id_envio===selected.id_envio ? {...e,empresa_envio:emp,guia:gu||null,transportadora:emp||'Sin asignar',ciudad:ci||'N/D',ciudad_envio:ci} : e));
      setSelected(s => s ? {...s,empresa_envio:emp,guia:gu||null,transportadora:emp||'Sin asignar',ciudad:ci||'N/D',ciudad_envio:ci} : s);
      setEstadoErr('');
      await obtenerEnvios({ silent: true });
    } catch(e) { setLogErr(e.message||'Error'); } finally { setLogSaving(false); }
  };

  const ciudades = [...new Set(envios.map(e=>e.ciudad).filter(c=>c!=null&&String(c).trim()!==''))];
  const filtrados = useMemo(() => envios.filter(e => {
    const q = search.toLowerCase();
    return (e.cliente?.toLowerCase().includes(q) || e.guia?.toLowerCase().includes(q) || e.id_pedido?.toString().includes(q))
      && (estadoFiltro==='todos' || e.estado===estadoFiltro)
      && (ciudadFiltro==='todas' || e.ciudad===ciudadFiltro);
  }), [envios, search, estadoFiltro, ciudadFiltro]);

  const conteoEstado = (key) => key==='todos' ? envios.length : envios.filter(e=>e.estado===key).length;

  return (
    <div className="pedido-container">
      <div className="pedido-topbar">
        <div>
          <h2 className="pedido-title">Gestión de Envíos</h2>
          <p className="pedido-subtitle">{loading ? 'Cargando…' : `${filtrados.length} de ${envios.length} envíos`}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,background:'#fff',border:'1px solid #ece4e7',borderRadius:10,overflow:'hidden',marginBottom:16}}>
        {[{key:'lista',label:'Gestión de envíos'},{key:'reporte',label:'Reporte de envíos'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{flex:1,padding:'11px 16px',border:'none',background:tab===t.key?'#fdf0f2':'transparent',
              color:tab===t.key?'#c9536a':'#7a5a65',fontFamily:'inherit',fontSize:13,
              fontWeight:tab===t.key?600:400,cursor:'pointer',
              borderBottom:tab===t.key?'2px solid #c9536a':'2px solid transparent',transition:'all 0.15s'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LISTA ── */}
      {tab === 'lista' && (
        <>
          {estadoErr && (
            <div className="envios-error">
              {estadoErr}
            </div>
          )}

          <div className="pedido-filters">
            <div className="pedido-search-wrap">
              <Search className="pedido-search-ico" size={15} strokeWidth={2}/>
              <input type="text" placeholder="Buscar guía o cliente..." className="pedido-search" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="pedido-estado-filters">
              {FILTROS_ESTADO.map(({key,label}) => (
                <button key={key} type="button" className={`pedido-filter-btn${estadoFiltro===key?' active':''}`} onClick={()=>setEstadoFiltro(key)}>
                  {label}<span className="pedido-filter-count">{conteoEstado(key)}</span>
                </button>
              ))}
            </div>
            <div className="envios-city-wrap">
              <select className="envios-select" value={ciudadFiltro} onChange={e=>setCiudadFiltro(e.target.value)}>
                <option value="todas">Todas las ciudades</option>
                {ciudades.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="pedido-table-wrap">
            {loading ? <div className="pedido-empty">Cargando envíos…</div>
            : filtrados.length===0 ? <div className="pedido-empty">No se encontraron envíos.</div>
            : (
              <table className="pedido-table">
                <thead><tr>
                  {['ID','Cliente','Ciudad','Transportadora','Guía','Estado','Fecha','Acciones'].map(h=><th key={h}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtrados.map(envio => {
                    const cfg = estadoConfig[envio.estado] || {label:envio.estado||'—',bg:'#f4f4f5',color:'#52525b',border:'#d4d4d8'};
                    return (
                      <tr key={envio.id_envio}>
                        <td><div className="pedido-td-id">ENV-{envio.id_envio}</div><div className="envios-pedido-sub">PED-{envio.id_pedido}</div></td>
                        <td><div className="pedido-cliente-name">{envio.cliente}</div></td>
                        <td>{envio.ciudad}</td>
                        <td>{envio.transportadora}</td>
                        <td>{envio.guia || <span className="envios-no-guia">Sin asignar</span>}</td>
                        <td><span className="pedido-estado-pill" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>{cfg.label}</span></td>
                        <td className="pedido-td-fecha">{envio.fecha}</td>
                        <td className="pedido-td-acciones">
                          <button type="button" className="pedido-btn-detail" onClick={()=>setSelected(envio)}><Eye size={13} strokeWidth={2}/>Ver</button>
                          {envio.estado !== 'entregado' && (
                            <button
                              type="button"
                              className="pedido-btn-estado"
                              disabled={savingId === envio.id_envio}
                              onClick={() => cambiarEstado(envio, envio.estado === 'en camino' ? 'entregado' : 'en camino')}
                            >
                              <Truck size={13} strokeWidth={2}/>
                              {savingId === envio.id_envio ? 'Guardando...' : envio.estado === 'en camino' ? 'Marcar entregado' : 'Marcar en camino'}
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
        </>
      )}

      {/* ── REPORTE ── */}
      {tab === 'reporte' && (
        <>
          <div style={{display:'flex',alignItems:'flex-end',gap:12,background:'#fff',border:'1px solid #ece4e7',borderRadius:12,padding:'16px 20px',marginBottom:16,flexWrap:'wrap'}}>
            {[{label:'Desde',val:fechaInicio,set:setFechaInicio,type:'date'},{label:'Hasta',val:fechaFin,set:setFechaFin,type:'date'}].map(f=>(
              <div key={f.label} style={{display:'flex',flexDirection:'column',gap:5}}>
                <label style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85'}}>{f.label}</label>
                <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)}
                  style={{background:'#faf7f8',border:'1.5px solid #ece4e7',borderRadius:8,padding:'8px 12px',fontFamily:'inherit',fontSize:13,color:'#1a1015',outline:'none'}}/>
              </div>
            ))}
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              <label style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85'}}>Estado</label>
              <select value={estadoRep} onChange={e=>setEstadoRep(e.target.value)}
                style={{background:'#faf7f8',border:'1.5px solid #ece4e7',borderRadius:8,padding:'8px 12px',fontFamily:'inherit',fontSize:13,color:'#1a1015',outline:'none'}}>
                <option value="">Todos</option>
                <option value="en camino">En camino</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <button onClick={cargarReporte} disabled={repLoading}
              style={{padding:'9px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c9536a,#a03d52)',color:'#fff',fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer',opacity:repLoading?0.6:1,alignSelf:'flex-end'}}>
              {repLoading ? 'Cargando...' : 'Aplicar'}
            </button>
          </div>

          {repError && <div style={{padding:'12px 16px',borderRadius:8,marginBottom:16,background:'#fff2f3',border:'1px solid #e8b4b8',borderLeft:'3px solid #c0606a',fontSize:13,color:'#a04050'}}>{repError}</div>}

          {repData && (
            <>
              {/* Tarjetas */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:14,marginBottom:16}}>
                {[
                  {label:'Total envíos',    value:repData.resumen.total,           color:'#1a1015'},
                  {label:'En camino',       value:repData.resumen.total_en_camino, color:'#2858a0'},
                  {label:'Entregados',      value:repData.resumen.total_entregado, color:'#207048'},
                  ...Object.entries(repData.resumen.por_transportadora).map(([k,v])=>({label:k,value:v,color:'#c9536a'})),
                ].map((s,i) => (
                  <div key={i} style={{background:'#fff',border:'1px solid #ece4e7',borderRadius:12,padding:'16px',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#c9536a,#e8849a)',borderRadius:'12px 12px 0 0'}}/>
                    <div style={{fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:4}}>{s.value}</div>
                    <div style={{fontSize:10,color:'#9c7a85',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:500}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabla */}
              <div style={{background:'#fff',border:'1px solid #ece4e7',borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr style={{background:'#fdf8f9'}}>
                      {['Envío','Pedido','Cliente','Ciudad','Transportadora','Guía','Estado','Fecha','Total','Productos'].map(h=>(
                        <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#b09aa0',borderBottom:'1px solid #f0eaec',whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {repData.envios.length===0 ? (
                      <tr><td colSpan="10" style={{padding:'48px 16px',textAlign:'center',color:'#9c7a85'}}>No hay envíos en este período.</td></tr>
                    ) : repData.envios.map(e => {
                      const cfg = estadoConfig[e.estado_envio] || {label:e.estado_envio,bg:'#f4f4f5',color:'#52525b',border:'#d4d4d8'};
                      return (
                        <tr key={e.id_envio} style={{borderBottom:'1px solid #faf7f8'}}>
                          <td style={{padding:'10px 14px',fontWeight:700,color:'#4a2030'}}>ENV-{e.id_envio}</td>
                          <td style={{padding:'10px 14px',color:'#7a5a65'}}>#{e.id_pedido}</td>
                          <td style={{padding:'10px 14px',fontWeight:500,color:'#1a1015'}}>{e.cliente}</td>
                          <td style={{padding:'10px 14px',color:'#7a5a65'}}>{e.ciudad||'—'}</td>
                          <td style={{padding:'10px 14px',color:'#7a5a65'}}>{e.empresa_envio||'Sin asignar'}</td>
                          <td style={{padding:'10px 14px',color:'#7a5a65'}}>{e.numero_guia||'—'}</td>
                          <td style={{padding:'10px 14px'}}><span className="pedido-estado-pill" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>{cfg.label}</span></td>
                          <td style={{padding:'10px 14px',color:'#9c7a85',fontSize:11}}>{fmtD(e.fecha_envio)}</td>
                          <td style={{padding:'10px 14px',fontWeight:700,color:'#207048'}}>{fmt(e.total)}</td>
                          <td style={{padding:'10px 14px',color:'#7a5a65',fontSize:11,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={e.productos}>{e.productos||'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {repLoading && <div style={{padding:48,textAlign:'center',color:'#9c7a85',fontSize:13}}>Cargando reporte...</div>}
        </>
      )}

      {/* Modal detalle envío */}
      {selected && (
        <div className="pedido-modal-overlay" onClick={()=>setSelected(null)} role="presentation">
          <div className="pedido-modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="pedido-modal-header">
              <div>
                <h3 className="pedido-modal-title">Detalle del envío</h3>
                <p className="pedido-modal-sub">ENV-{selected.id_envio} · PED-{selected.id_pedido}</p>
              </div>
              <button type="button" className="pedido-modal-close" onClick={()=>setSelected(null)}>×</button>
            </div>
            <div className="pedido-modal-body">
              <div className="pedido-modal-section">
                <div className="pedido-modal-section-title">Cliente</div>
                <div className="pedido-modal-info-row"><span>{selected.cliente}</span><span style={{color:'#9c7a85'}}>{selected.telefono}</span></div>
                <div style={{fontSize:12,color:'#9c7a85',marginTop:8,lineHeight:1.5}}>{selected.direccion}<br/>{selected.ciudad}</div>
              </div>
              <div className="pedido-modal-section">
                <div className="pedido-modal-section-title">Logística</div>
                <p style={{fontSize:12,color:'#9c7a85',marginBottom:10}}>Define la transportadora, guía y ciudad de envío.</p>
                {[{label:'Transportadora',val:logEmpresa,set:setLogEmpresa,ph:'Ej. Servientrega, Coordinadora…'},
                  {label:'Número de guía',val:logGuia,set:setLogGuia,ph:'Guía de rastreo'},
                  {label:'Ciudad de envío',val:logCiudad,set:setLogCiudad,ph:'Ciudad (opcional)'}].map(f=>(
                  <div key={f.label}>
                    <label className="pedido-modal-section-title" style={{marginTop:8}}>{f.label}</label>
                    <input type="text" className="pedido-search" style={{width:'100%',marginBottom:10}} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}/>
                  </div>
                ))}
                {logErr && <p style={{fontSize:12,color:'#b91c1c',marginBottom:8}}>{logErr}</p>}
                <button type="button" className="pedido-btn-estado" style={{marginTop:4}} onClick={guardarLogistica} disabled={logSaving}>
                  {logSaving?'Guardando…':'Guardar logística'}
                </button>
              </div>
              <div className="pedido-modal-section">
                <div className="pedido-modal-section-title">Productos</div>
                <div className="envios-products">{(selected.productos||[]).map(p=><span key={p}>{p}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
