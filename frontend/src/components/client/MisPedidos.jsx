import { useEffect, useState } from 'react';
import { productService } from '../../services/productService';

const fmt     = (n) => `$${Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });

// Muestra el estado del envio si existe, sino el del pedido
const getEstadoVisible = (p) => {
  // Prioridad: estado del envio (mas especifico) sobre estado del pedido
  if (p.estado_envio === 'entregado') return { label: 'Entregado',  color: '#207048', bg: '#eaf8ee', border: '#90d8a8' };
  if (p.estado_envio === 'en camino') return { label: 'En camino',  color: '#2858a0', bg: '#eaf2ff', border: '#90b8f0' };
  // Sin estado de envio, usar estado del pedido
  if (p.estado === 'entregado')       return { label: 'Entregado',  color: '#207048', bg: '#eaf8ee', border: '#90d8a8' };
  if (p.estado === 'enviado')         return { label: 'Enviado',    color: '#2858a0', bg: '#eaf2ff', border: '#90b8f0' };
  // Por defecto: pendiente
  return                                     { label: 'Pendiente',  color: '#a07020', bg: '#fff8e8', border: '#edd890' };
};

const InfoChip = ({ label, value }) => (
  <div style={{display:'flex',flexDirection:'column',gap:2}}>
    <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#b09aa0'}}>{label}</span>
    <span style={{fontSize:12,fontWeight:500,color:'#1a1015'}}>{value}</span>
  </div>
);

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const userId = localStorage.getItem('userId');

  const loadPedidos = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await productService.getPedidosUsuario(userId);
      setPedidos(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (pedido) => {
    try {
      const res  = await fetch(`http://localhost:3000/api/pedidos/${pedido.id_pedido}`);
      const data = await res.json();
      setDetalle({ ...data, estado_envio: pedido.estado_envio, empresa_envio: pedido.empresa_envio, numero_guia: pedido.numero_guia, ciudad: pedido.ciudad, direccion_envio: pedido.direccion_envio });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadPedidos(); }, []);

  if (loading) return <div className="cliente-card"><p style={{color:'#9c7a85',fontSize:13}}>Cargando pedidos...</p></div>;

  return (
    <div className="cliente-card">
      <h3 style={{marginBottom:20}}>Mis pedidos</h3>

      {pedidos.length === 0 ? (
        <p style={{color:'#9c7a85',fontSize:13}}>No tienes pedidos aún.</p>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {pedidos.map(p => {
            const est = getEstadoVisible(p);
            return (
              <div key={p.id_pedido} style={{background:'#fff',border:'1px solid #ece4e7',borderRadius:12,padding:'16px 18px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                  <div>
                    <div style={{fontWeight:700,color:'#1a1015',fontSize:14}}>Pedido #{p.id_pedido}</div>
                    <div style={{fontSize:12,color:'#9c7a85',marginTop:3}}>{fmtDate(p.fecha)}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{
                      padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700,
                      letterSpacing:'0.06em',textTransform:'uppercase',
                      background:est.bg,color:est.color,border:`1px solid ${est.border}`
                    }}>
                      {est.label}
                    </span>
                    <span style={{fontWeight:700,color:'#c9536a',fontSize:15}}>{fmt(p.total)}</span>
                    <button
                      onClick={() => verDetalle(p)}
                      style={{padding:'6px 14px',borderRadius:7,border:'1.5px solid #ece4e7',background:'#fff',color:'#7a5a65',fontFamily:'inherit',fontSize:12,fontWeight:500,cursor:'pointer'}}
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>

                {/* Info de envio si existe */}
                {p.estado_envio && (
                  <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #f5f0f2',display:'flex',gap:24,flexWrap:'wrap'}}>
                    {p.empresa_envio  && <InfoChip label="Transportadora" value={p.empresa_envio} />}
                    {p.numero_guia    && <InfoChip label="Guia" value={p.numero_guia} />}
                    {p.ciudad         && <InfoChip label="Ciudad" value={p.ciudad} />}
                    {p.direccion_envio && <InfoChip label="Direccion" value={p.direccion_envio} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:24,backdropFilter:'blur(3px)'}}
          onClick={() => setDetalle(null)}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:520,maxHeight:'85vh',overflowY:'auto',boxShadow:'0 24px 60px rgba(0,0,0,0.18)'}}
            onClick={e => e.stopPropagation()}>

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid #f0eaec',position:'sticky',top:0,background:'#fff',zIndex:1}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#1a1015'}}>Pedido #{detalle.id_pedido}</div>
                <div style={{fontSize:11,color:'#9c7a85'}}>{fmtDate(detalle.fecha)}</div>
              </div>
              <button onClick={() => setDetalle(null)} style={{background:'none',border:'none',fontSize:22,color:'#9c7a85',cursor:'pointer'}}>×</button>
            </div>

            <div style={{padding:'20px 22px'}}>
              {/* Estado */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85',marginBottom:8}}>Estado</div>
                {(() => { const est = getEstadoVisible(detalle); return (
                  <span style={{padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700,textTransform:'uppercase',background:est.bg,color:est.color,border:`1px solid ${est.border}`}}>{est.label}</span>
                ); })()}
              </div>

              {/* Productos */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85',marginBottom:8}}>Productos</div>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr style={{background:'#faf7f8'}}>
                      <th style={{textAlign:'left',padding:'7px 10px',color:'#9c7a85',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em'}}>Producto</th>
                      <th style={{textAlign:'left',padding:'7px 10px',color:'#9c7a85',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em'}}>Cant.</th>
                      <th style={{textAlign:'left',padding:'7px 10px',color:'#9c7a85',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em'}}>Precio</th>
                      <th style={{textAlign:'left',padding:'7px 10px',color:'#9c7a85',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em'}}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detalle.detalles || []).map(d => (
                      <tr key={d.id_detalle} style={{borderBottom:'1px solid #faf7f8'}}>
                        <td style={{padding:'9px 10px',color:'#1a1015'}}>{d.nombre_producto}</td>
                        <td style={{padding:'9px 10px'}}>{d.cantidad}</td>
                        <td style={{padding:'9px 10px'}}>{fmt(d.precio_unitario)}</td>
                        <td style={{padding:'9px 10px',fontWeight:600,color:'#c9536a'}}>{fmt(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{textAlign:'right',fontSize:14,color:'#9c7a85',marginTop:10,paddingTop:10,borderTop:'1px solid #f0eaec'}}>
                  Total: <strong style={{color:'#c9536a',fontSize:16}}>{fmt(detalle.total)}</strong>
                </div>
              </div>

              {/* Envio */}
              {(detalle.estado_envio || detalle.empresa_envio) && (
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'#9c7a85',marginBottom:8}}>Información de envío</div>
                  <div style={{background:'#faf7f8',borderRadius:8,padding:'12px 14px',fontSize:13,color:'#7a5a65',display:'flex',flexDirection:'column',gap:6}}>
                    {detalle.empresa_envio  && <div>🚚 Transportadora: <b>{detalle.empresa_envio}</b></div>}
                    {detalle.numero_guia    && <div>📦 Guía: <b>{detalle.numero_guia}</b></div>}
                    {detalle.ciudad         && <div>📍 Ciudad: {detalle.ciudad}</div>}
                    {detalle.direccion_envio && <div>🏠 Dirección: {detalle.direccion_envio}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
