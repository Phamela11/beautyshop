import { Icons } from "../../data/clientData";

const Topbar = ({ title, cartCount, setActive }) => (
  <header className="topbar">
    <span className="topbar-title">{title}</span>
    <div className="topbar-right">
      <button className="topbar-icon-btn" title="Notificaciones">
        {Icons.bell}
        <span className="topbar-notif-dot" />
      </button>
      <button className="topbar-icon-btn" onClick={() => setActive("carrito")} title="Carrito" style={{ position: "relative" }}>
        {Icons.cart}
        {cartCount > 0 && (
          <span style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            background: "#c9536a",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff"
          }}>
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </header>
);

export default Topbar;