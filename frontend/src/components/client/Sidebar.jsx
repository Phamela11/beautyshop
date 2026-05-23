import { Icons, NAV_ITEMS } from "../../data/clientData";

const Sidebar = ({ active, setActive, userName, initials, handleLogout }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <div className="sidebar-brand-name">Beauty<span>Shop</span></div>
      <div className="sidebar-brand-sub">Tu tienda de maquillaje</div>
    </div>

    <div className="sidebar-user">
      <div className="sidebar-avatar">{initials}</div>
      <div>
        <div className="sidebar-user-name">{userName}</div>
        <div className="sidebar-user-role">Cliente</div>
      </div>
    </div>

    <nav className="sidebar-nav">
      <div className="nav-section-label">Menu</div>
      {NAV_ITEMS.map(item => (
        <button
          key={item.key}
          className={`nav-item${active === item.key ? " active" : ""}`}
          onClick={() => setActive(item.key)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
          {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
        </button>
      ))}
    </nav>

    <div className="sidebar-footer">
      <button className="logout-btn" onClick={handleLogout}>
        <span className="nav-icon">{Icons.logout}</span>
        Cerrar sesion
      </button>
    </div>
  </aside>
);

export default Sidebar;