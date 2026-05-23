
const Sidebar = ({ catActiva, setCat, minPrice, setMinPrice, maxPrice, setMaxPrice, applyPriceFilter, categorias = [] }) => (
  <aside className="filtros-panel">
    <div className="filtro-card">
      <div className="filtro-title">Categorias</div>
      {categorias.map(c => (
        <button
          key={c.name}
          className={`filtro-option${catActiva === c.name ? " active" : ""}`}
          onClick={() => setCat(c.name)}
        >
          <span className="filtro-dot" />
          {c.name}
          <span className="filtro-count">{c.count}</span>
        </button>
      ))}
    </div>

    <div className="filtro-card">
      <div className="filtro-title">Precio</div>
      <div className="price-range">
        <input
          className="price-input"
          placeholder="Min"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          type="number"
        />
        <span className="price-sep">—</span>
        <input
          className="price-input"
          placeholder="Max"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          type="number"
        />
      </div>
      <button className="apply-btn" onClick={applyPriceFilter}>
        Aplicar
      </button>
    </div>
  </aside>
);

export default Sidebar;