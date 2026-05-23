import { Ic } from "../../data/adminData";

const Sidebar = ({ active, setActive, userName, initials, sections, NAV, handleLogout }) => (
  <aside className="sidebar">
    <div className="sb-brand">
      <div className="sb-brand-name">Beauty<span>Shop</span></div>
      <div className="sb-brand-sub">Sistema de administracion</div>
      <div className="sb-admin-badge">
        {Ic.shield} Admin
      </div>
    </div>

    <div className="sb-user">
      <div className="sb-avatar">{initials}</div>
      <div>
        <div className="sb-user-name">{userName}</div>
        <div className="sb-user-role">Administrador</div>
      </div>
    </div>

    <nav className="sb-nav">
      {sections.map(section => (
        <div key={section}>
          <div className="sb-section-label">{section}</div>
          {NAV.filter(n => n.section === section).map(item => (
            <button
              key={item.key}
              className={`sb-item${active === item.key ? " active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              <span className="sb-icon">{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className="sb-badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      ))}
    </nav>

    <div className="sb-footer">
      <button className="sb-logout" onClick={handleLogout}>
        <span className="sb-icon">{Ic.logout}</span>
        Cerrar sesion
      </button>
    </div>
  </aside>
);

export default Sidebar;