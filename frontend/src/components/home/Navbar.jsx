import { Ic } from "../../data/homeData";

const Navbar = ({ search, setSearch, activeFilter, setFilter, navigate, categories = [] }) => {
  return (
    <nav className="navbar">
      <a className="navbar-brand">Beauty<span>Shop</span></a>

      <div className="navbar-search">
        <span className="navbar-search-icon">{Ic.search}</span>
        <input
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="navbar-cats">
        {categories.map(c => (
          <button
            key={c}
            className={`navbar-cat${activeFilter === c ? " active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="navbar-actions">
        <button className="nav-icon-btn" onClick={() => navigate("/login")}>
          {Ic.user}
        </button>
        <button className="btn-login" onClick={() => navigate("/login")}>
          Iniciar sesion
        </button>
        <button className="btn-register" onClick={() => navigate("/register")}>
          Registrarse
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
