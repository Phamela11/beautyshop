import { Ic } from "../../data/homeData";

const API_BASE = "http://localhost:3000";
const fmt = (n) => n > 0 ? `$${Math.round(n).toLocaleString('es-CO')}` : null;

const Hero = ({ navigate, stats }) => {
  const masVendido = stats?.mas_vendido || null;

  const statItems = [
    { value: stats ? stats.total_productos : "—", label: "Productos"  },
    { value: stats ? stats.total_clientes  : "—", label: "Clientes"   },
    { value: stats ? stats.total_pedidos   : "—", label: "Pedidos"    },
    { value: "2026",                               label: "Desde"      },
  ];

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tag">Nueva coleccion 2026</span>
        <h1>Realza tu <span>belleza</span> con los mejores productos</h1>
        <p>Descubre nuestra seleccion de maquillaje de alta calidad. Marcas premium, precios accesibles y envio a toda Colombia.</p>
        <div className="hero-btns">
          <button
            className="hero-btn-primary"
            onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver catalogo
          </button>
          <button className="hero-btn-secondary" onClick={() => navigate("/register")}>
            Crear cuenta gratis
          </button>
        </div>
        <div className="hero-stats">
          {statItems.map(({ value, label }) => (
            <div key={label}>
              <div className="hero-stat-value">{value}</div>
              <div className="hero-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Producto más vendido */}
      <div className="hero-visual">
        <div className="hero-card">
          <span className="hero-card-tag">MAS VENDIDO</span>
          {masVendido ? (
            <>
              <div className="hero-card-img">
                {masVendido.url_imagen ? (
                  <img
                    src={`${API_BASE}${masVendido.url_imagen}`}
                    alt={masVendido.nombre}
                    style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:12 }}
                    onError={e => { e.target.style.display='none'; }}
                  />
                ) : Ic.lipstick}
              </div>
              <div className="hero-card-name">{masVendido.nombre}</div>
              <div className="hero-card-price">
                {fmt(masVendido.precio) || 'Agotado'}
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:4 }}>
                {masVendido.total_vendido} unidades vendidas
              </div>
            </>
          ) : (
            <>
              <div className="hero-card-img">{Ic.lipstick}</div>
              <div className="hero-card-name" style={{ color:'rgba(255,255,255,0.4)' }}>
                Sin ventas aún
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
