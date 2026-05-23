import { useState, useEffect } from "react";
import { Ic } from "../../data/adminData";
import { productService } from "../../services/productService";

const API = "http://localhost:3000/api";

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO");

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    pedidosPendientes: 0,
    clientesActivos: 0,
    productosStock: 0,
    enviosEnCamino: 0,
    stockBajo: [],
  });
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Pedidos
        const pedidosData = await productService.getPedidos();
        setPedidos(pedidosData.slice(0, 5));

        const hoy = new Date().toDateString();
        const ventasHoy = pedidosData
          .filter(p => new Date(p.fecha).toDateString() === hoy)
          .reduce((acc, p) => acc + Number(p.total || 0), 0);

        const pendientes = pedidosData.filter(p => p.estado === "pendiente").length;
        const enviados   = pedidosData.filter(p => p.estado === "enviado").length;

        // Clientes únicos
        const clientesUnicos = new Set(pedidosData.map(p => p.id_usuario)).size;

        // Productos
        const productos = await productService.getProducts();
        const conStock  = productos.filter(p => p.stock > 0).length;
        const stockBajo = productos
          .filter(p => p.stock > 0 && p.stock <= 10)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5)
          .map(p => ({
            nombre: p.nombre,
            cat: p.nombre_categoria || "Sin categoría",
            qty: p.stock,
            level: p.stock <= 5 ? "critical" : "low",
          }));

        setStats({
          ventasHoy,
          pedidosPendientes: pendientes,
          clientesActivos: clientesUnicos,
          productosStock: conStock,
          enviosEnCamino: enviados,
          stockBajo,
        });
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#9c7a85", fontSize: 14 }}>
        Cargando dashboard...
      </div>
    );
  }

  const statCards = [
    { icon: Ic.chart,   value: fmt(stats.ventasHoy),         label: "Ventas hoy",         change: "Total del dia",          dir: "up"   },
    { icon: Ic.package, value: stats.pedidosPendientes,       label: "Pedidos pendientes",  change: "Requieren atencion",     dir: stats.pedidosPendientes > 0 ? "down" : "up" },
    { icon: Ic.users,   value: stats.clientesActivos,         label: "Clientes con pedidos",change: "Con al menos 1 pedido",  dir: "up"   },
    { icon: Ic.archive, value: stats.productosStock,          label: "Productos con stock", change: `${stats.stockBajo.length} con stock bajo`, dir: stats.stockBajo.length > 0 ? "down" : "up" },
    { icon: Ic.truck,   value: stats.enviosEnCamino,          label: "Pedidos enviados",    change: "En camino al cliente",   dir: "up"   },
  ];

  return (
    <>
      <div className="dash-greeting">
        <h2>Panel de administracion</h2>
        <p>Resumen del negocio — {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="stat-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className={`stat-card-change ${s.dir}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        {/* Pedidos recientes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Pedidos recientes</span>
            <button className="dash-card-action" onClick={() => onNavigate && onNavigate("pedidos")}>
              Ver todos
            </button>
          </div>
          {pedidos.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#9c7a85", fontSize: 13 }}>
              No hay pedidos registrados aun.
            </div>
          ) : (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => (
                  <tr key={p.id_pedido}>
                    <td style={{ fontWeight: 600 }}>#{p.id_pedido}</td>
                    <td>{p.nombre_usuario || "Cliente"}</td>
                    <td style={{ color: "#9c7a85" }}>{fmtDate(p.fecha)}</td>
                    <td>
                      <span className={`status-pill pill-${p.estado}`}>{p.estado}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#c9536a" }}>{fmt(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stock bajo */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Stock bajo</span>
            <button className="dash-card-action" onClick={() => onNavigate && onNavigate("inventario")}>
              Ver inventario
            </button>
          </div>
          {stats.stockBajo.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#9c7a85", fontSize: 13 }}>
              Todos los productos tienen stock suficiente.
            </div>
          ) : (
            <div className="stock-list">
              {stats.stockBajo.map(p => (
                <div className="stock-item" key={p.nombre}>
                  <div>
                    <div className="stock-name">{p.nombre}</div>
                    <div className="stock-cat">{p.cat}</div>
                  </div>
                  <span className={`stock-qty ${p.level}`}>{p.qty} und</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
