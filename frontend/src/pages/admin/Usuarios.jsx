import { useState, useEffect, useCallback } from 'react';
import './Usuarios.css';
import { userService } from '../../services/userService';

const API = "https://beautyshop-production.up.railway.app/api";
const fmt  = (n) => `$${Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
const fmtD = (d) => d ? new Date(d).toLocaleDateString('es-CO') : '—';

const Usuarios = () => {
  const [tab, setTab]         = useState('lista'); // 'lista' | 'reporte'
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Reporte
  const [repData,    setRepData]    = useState(null);
  const [repLoading, setRepLoading] = useState(false);
  const [repError,   setRepError]   = useState(null);
  const today        = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(firstOfMonth);
  const [fechaFin,    setFechaFin]    = useState(today);
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  const loadUsuarios = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await userService.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarReporte = async () => {
    setRepLoading(true); setRepError(null);
    try {
      const params = new URLSearchParams();
      if (fechaInicio)    params.set('fecha_inicio', fechaInicio);
      if (fechaFin)       params.set('fecha_fin',    fechaFin);
      if (usuarioFiltro)  params.set('id_usuario',   usuarioFiltro);
      const res  = await fetch(`${API}/reportes/usuarios?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al cargar reporte');
      setRepData(json);
    } catch (err) {
      setRepError(err.message);
    } finally {
      setRepLoading(false);
    }
  };

  useEffect(() => { loadUsuarios(); }, [loadUsuarios]);
  useEffect(() => { if (tab === 'reporte' && !repData) cargarReporte(); }, [tab]);

  const clientes = usuarios.filter(u => u.rol === 'cliente');
  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <div>
          <h2>Usuarios</h2>
          <p>Lista y reporte de actividad de clientes.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,background:'#fff',border:'1px solid #ece4e7',borderRadius:10,overflow:'hidden',marginBottom:20}}>
        {[{key:'lista',label:'Lista de usuarios'},{key:'reporte',label:'Reporte de clientes'}].map(t => (
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
          <div style={{marginBottom:14}}>
            <input
              type="text" placeholder="Buscar por nombre o correo..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{width:'100%',maxWidth:340,background:'#fff',border:'1.5px solid #ece4e7',borderRadius:8,padding:'9px 13px',fontFamily:'inherit',fontSize:13,color:'#1a1015',outline:'none'}}
            />
          </div>
          {error && <div className="usuarios-error">{error}</div>}
          {loading ? (
            <div style={{padding:48,textAlign:'center',color:'#9c7a85',fontSize:13}}>Cargando...</div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #ece4e7',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{background:'#fdf8f9'}}>
                    {['ID','Nombre','Correo','Dirección','Rol','Registro'].map(h => (
                      <th key={h} style={{textAlign:'left',padding:'11px 16px',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'#b09aa0',borderBottom:'1px solid #f0eaec'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr><td colSpan="6" style={{padding:'48px 16px',textAlign:'center',color:'#9c7a85'}}>No hay usuarios registrados.</td></tr>
                  ) : filtrados.map(u => (
                    <tr key={u.id_usuario} style={{borderBottom:'1px solid #faf7f8'}}>
                      <td style={{padding:'12px 16px',color:'#4a2030',fontWeight:700}}>#{u.id_usuario}</td>
                      <td style={{padding:'12px 16px',fontWeight:500,color:'#1a1015'}}>{u.nombre}</td>
                      <td style={{padding:'12px 16px',color:'#7a5a65'}}>{u.correo}</td>
                      <td style={{padding:'12px 16px',color:'#9c7a85'}}>{u.direccion || '—'}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700,textTransform:'uppercase',
                          background: u.rol==='admin'?'rgba(201,83,106,0.12)':'#eaf8ee',
                          color:      u.rol==='admin'?'#c9536a':'#207048',
                          border:     `1px solid ${u.rol==='admin'?'rgba(201,83,106,0.25)':'#90d8a8'}`}}>
                          {u.rol || 'Sin rol'}
                        </span>
                      </td>
                      <td style={{padding:'12px 16px',color:'#9c7a85',fontSize:12}}>{fmtD(u.fecha_registro)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── REPORTE ── */}
      {tab === 'reporte' && (
        <>
          {/* Filtros */}
          <div style={{display:'flex',alignItems:'flex-end',gap:12,background:'#fff',border:'1px solid #ece4e7',borderRadius:12,padding:'16px 20px',marginBottom:16,flexWrap:'wrap'}}>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              <label style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85'}}>Desde</label>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                style={{background:'#faf7f8',border:'1.5px solid #ece4e7',borderRadius:8,padding:'8px 12px',fontFamily:'inherit',fontSize:13,color:'#1a1015',outline:'none'}}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              <label style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85'}}>Hasta</label>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                style={{background:'#faf7f8',border:'1.5px solid #ece4e7',borderRadius:8,padding:'8px 12px',fontFamily:'inherit',fontSize:13,color:'#1a1015',outline:'none'}}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5,flex:1,minWidth:160}}>
              <label style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85'}}>Cliente específico</label>
              <select value={usuarioFiltro} onChange={e => setUsuarioFiltro(e.target.value)}
                style={{background:'#faf7f8',border:'1.5px solid #ece4e7',borderRadius:8,padding:'8px 12px',fontFamily:'inherit',fontSize:13,color:'#1a1015',outline:'none'}}>
                <option value="">Todos los clientes</option>
                {clientes.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
              </select>
            </div>
            <button onClick={cargarReporte} disabled={repLoading}
              style={{padding:'9px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c9536a,#a03d52)',color:'#fff',fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer',opacity:repLoading?0.6:1}}>
              {repLoading ? 'Cargando...' : 'Aplicar'}
            </button>
          </div>

          {repError && <div style={{padding:'12px 16px',borderRadius:8,marginBottom:16,background:'#fff2f3',border:'1px solid #e8b4b8',borderLeft:'3px solid #c0606a',fontSize:13,color:'#a04050'}}>{repError}</div>}

          {/* Tarjetas resumen */}
          {repData && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:14,marginBottom:20}}>
              {[
                {label:'Clientes activos', value:repData.resumen.total_clientes,  color:'#1a1015'},
                {label:'Pedidos totales',  value:repData.resumen.total_pedidos,   color:'#2858a0'},
                {label:'Ingresos totales', value:fmt(repData.resumen.total_ingresos), color:'#207048'},
                {label:'Uds. compradas',   value:repData.resumen.total_unidades,  color:'#c9536a'},
              ].map(s => (
                <div key={s.label} style={{background:'#fff',border:'1px solid #ece4e7',borderRadius:12,padding:'18px 16px',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#c9536a,#e8849a)',borderRadius:'12px 12px 0 0'}}/>
                  <div style={{fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:5}}>{s.value}</div>
                  <div style={{fontSize:11,color:'#9c7a85',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:500}}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabla de clientes */}
          {repLoading && <div style={{padding:48,textAlign:'center',color:'#9c7a85',fontSize:13}}>Cargando reporte...</div>}
          {repData && !repLoading && (
            <div style={{background:'#fff',border:'1px solid #ece4e7',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{background:'#fdf8f9'}}>
                    {['Cliente','Correo','Pedidos','Total gastado','Uds.','Primera compra','Última compra','Productos'].map(h => (
                      <th key={h} style={{textAlign:'left',padding:'11px 14px',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#b09aa0',borderBottom:'1px solid #f0eaec',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {repData.usuarios.length === 0 ? (
                    <tr><td colSpan="8" style={{padding:'48px 16px',textAlign:'center',color:'#9c7a85'}}>No hay clientes con compras en este período.</td></tr>
                  ) : repData.usuarios.map(u => (
                    <tr key={u.id_usuario} style={{borderBottom:'1px solid #faf7f8'}}>
                      <td style={{padding:'11px 14px',fontWeight:600,color:'#1a1015'}}>{u.nombre}</td>
                      <td style={{padding:'11px 14px',color:'#7a5a65',fontSize:12}}>{u.correo}</td>
                      <td style={{padding:'11px 14px',fontWeight:700,color:'#2858a0',textAlign:'center'}}>{u.total_pedidos}</td>
                      <td style={{padding:'11px 14px',fontWeight:700,color:'#207048'}}>{fmt(u.total_gastado)}</td>
                      <td style={{padding:'11px 14px',textAlign:'center'}}>{u.total_unidades}</td>
                      <td style={{padding:'11px 14px',color:'#9c7a85',fontSize:12}}>{fmtD(u.primera_compra)}</td>
                      <td style={{padding:'11px 14px',color:'#9c7a85',fontSize:12}}>{fmtD(u.ultima_compra)}</td>
                      <td style={{padding:'11px 14px',color:'#7a5a65',fontSize:11,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={u.productos}>{u.productos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Usuarios;
