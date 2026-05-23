import { Ic } from "../../data/homeData";
import StarRow from "../global/StarRow";

const API_BASE = "http://localhost:3000";

const Catalog = ({ filtered, activeFilter, setFilter, addToCart, categories, loading }) => {
  return (
    <section className="catalog-section" id="catalogo">
      <div className="section-header">
        <div>
          <div className="section-title">Nuestros productos</div>
          <div className="section-subtitle">
            {loading ? "Cargando..." : `${filtered.length} productos disponibles`}
          </div>
        </div>
      </div>

      <div className="filters">
        {categories.map(c => (
          <button
            key={c}
            className={`filter-btn${activeFilter === c ? " active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9c7a85" }}>
          Cargando productos...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9c7a85" }}>
          No hay productos disponibles en esta categoría.
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map(p => (
            <div className="product-card" key={p.id}>
              <div className="product-img">
                {p.imagen ? (
                  <img
                    src={p.imagen}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  Ic.lipstick
                )}
                {p.badge && (
                  <span className={`product-badge${p.badge === "Nuevo" ? " new" : ""}`}>
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="product-info">
                <div className="product-cat">{p.cat}</div>
                <div className="product-name">{p.name}</div>
                <StarRow stars={p.stars} reviews={p.reviews} />
                <div className="product-desc">{p.desc}</div>
                <div className="product-footer">
                  <div>
                    {p.stock > 0 && p.price > 0 ? (
                      <span className="product-price">${Number(p.price).toLocaleString('es-CO')}</span>
                    ) : (
                      <span style={{fontSize:11,fontWeight:700,color:'#c9536a',background:'#fdf0f2',border:'1px solid #f0c0ca',padding:'2px 10px',borderRadius:20,letterSpacing:'0.06em',textTransform:'uppercase'}}>
                        Agotado
                      </span>
                    )}
                  </div>
                  {p.stock > 0 && p.price > 0 && (
                    <button className="add-cart-btn" onClick={() => addToCart(p)} title="Agregar al carrito">
                      {Ic.plus}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Catalog;
