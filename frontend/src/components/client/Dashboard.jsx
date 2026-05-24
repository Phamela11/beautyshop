import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import { Icons } from "../../data/clientData";

const API = "https://beautyshop-production.up.railway.app/api";
const fmt     = (n) => `$${Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });

const getEstado = (p) => {
  if (p.estado_envio === 'entregado') return { label: 'Entregado', bg: '#eaf8ee', color: '#207048', border: '#90d8a8' };
  if (p.estado_envio === 'en camino') return { label: 'En camino', bg: '#eaf2ff', color: '#2858a0', border: '#90b8f0' };
  if (p.estado === 'entregado')       return { label: 'Entregado', bg: '#eaf8ee', color: '#207048', border: '#90d8a8' };
  if (p.estado === 'enviado')         return { label: 'En camino', bg: '#eaf2ff', color: '#2858a0', border: '#90b8f0' };
  return                                     { label: 'Pendiente', bg: '#fff8e8', color: '#a07020', border: '#edd890' };
};

const Dashboard = ({ setActive }) => {
  const userId   = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Usuario";

  const [loading,  setLoading]  = useState(true);
  const [pedidos,  setPedidos]  = useState([]);
  const [todosPedidos, setTodosPedidos] = useState([]);
  const [carrito,  setCarrito]  = useState(0);
  const [resenas,  setResenas]  = useState(0);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [peds, cart, resen, prods] = await Promise.all([
          productService.getPedidosUsuario(userId).catch(() => []),
          productService.getCarrito(userId).catch(() => ({ total_productos: 0 })),
          productService.getResenasUsuario(userId).catch(() => []),
          productService.getProducts().catch(() => []),
        ]);

        // Guardar TODOS los pedidos para calcular estadísticas correctas
        setTodosPedidos(peds);
        // Solo mostrar los últimos 5 en la tabla
        setPedidos(peds.slice(0, 5));
        setCarrito(Number(cart.total_productos || 0));
        // Reseñas: puede venir como array directo o como { resenas: [] }
        const resenasArr = Array.isArray(resen) ? resen : (resen?.resenas || []);
        setResenas(resenasArr.length);

        // Productos activos con stock
        const activos = prods
          .filter(p => p.activo !== 0 && p.stock > 0 && p.precio > 0)
          .slice(0, 4)
          .map(p => ({
            id:     p.id_producto,
            nombre: p.nombre,
            precio: fmt(p.precio),
            imagen: p.imagenes?.[0] ? `https://beautyshop-production.up.railway.app${p.imagenes[0]}` : null,
          }));
        setProductos(activos);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const totalGastado = todosPedidos.reduce((a, p) => a + Number(p.total || 0), 0);
  const nombre = userName.split(" ")[0];

  if (loading) return (
    <div style={{ padding: "60px 0", textAlign: "center", color: "#9c7a85", fontSize: 13 }}>
      Cargando...
    </div>
  );

  return (
    <>
      <div className="dash-greeting">
        <h2>Bienvenida, {nombre} 🌹</h2>
        <p>Aquí tienes un resumen de tu cuenta</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { icon: Icons.package, value: todosPedidos.length,    label: "Mis pedidos"    },
          { icon: Icons.cart,    value: carrito,                 label: "En carrito"     },
          { icon: Icons.star,    value: resenas,                 label: "Mis reseñas"    },
          { icon: Icons.box,     value: fmt(totalGastado),       label: "Total gastado"  },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value" style={{ fontSize: s.label === "Total gastado" ? 20 : 28 }}>
              {s.value}
            </div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        {/* Pedidos recientes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Pedidos recientes</span>
            <button
              className="dash-card-link"
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => setActive && setActive("pedidos")}
            >
              Ver todos
            </button>
          </div>
          <div className="order-list">
            {pedidos.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center", color: "#9c7a85", fontSize: 13 }}>
                No tienes pedidos aún.
              </div>
            ) : pedidos.map(p => {
              const est = getEstado(p);
              return (
                <div className="order-item" key={p.id_pedido}>
                  <div>
                    <div className="order-id">#{p.id_pedido}</div>
                    <div className="order-date">{fmtDate(p.fecha)}</div>
                  </div>
                  <span className="order-status" style={{
                    background: est.bg, color: est.color,
                    border: `1px solid ${est.border}`,
                    padding: "3px 10px", borderRadius: 20,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase"
                  }}>
                    {est.label}
                  </span>
                  <span className="order-total">{fmt(p.total)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productos destacados */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Productos disponibles</span>
            <button
              className="dash-card-link"
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => setActive && setActive("catalogo")}
            >
              Ver catálogo
            </button>
          </div>
          <div className="product-grid-mini">
            {productos.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center", color: "#9c7a85", fontSize: 13, gridColumn: "1/-1" }}>
                No hay productos disponibles.
              </div>
            ) : productos.map(p => (
              <div className="product-mini" key={p.id}
                style={{ cursor: "pointer" }}
                onClick={() => setActive && setActive("catalogo")}
              >
                <div className="product-mini-img" style={{
                  background: p.imagen ? "transparent" : "linear-gradient(135deg,#fdf0f2,#f5e8ec)",
                  overflow: "hidden"
                }}>
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    : null
                  }
                </div>
                <div className="product-mini-name">{p.nombre}</div>
                <div className="product-mini-price">{p.precio}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
