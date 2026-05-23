import { useEffect } from "react";
import { useClient } from "../../hooks/client/useClient";
import Sidebar from "../../components/client/Sidebar";
import Topbar from "../../components/client/Topbar";
import Dashboard from "../../components/client/Dashboard";
import ComingSoon from "../../components/client/ComingSoon";
import Carrito from "../../components/client/Carrito";
import MisPedidos from "../../components/client/MisPedidos";
import MisResenas from "../../components/client/MisResenas";
import Catalogo from "../catalogo/Catalogo";
import Perfil from "../perfil/Perfil";
import "./ClientLayout.css";

export default function ClientLayout() {
  const {
    active,
    setActive,
    cartCount,
    refreshCartCount,
    cartLimitModal,
    setCartLimitModal,
    cartErrorMessage,
    userName,
    initials,
    PAGE_TITLES,
    handleLogout,
    addToCart,
  } = useClient();

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  const renderPage = () => {
    if (active === "dashboard") return <Dashboard setActive={setActive} />;
    if (active === "catalogo") return <Catalogo onAddToCart={addToCart} />;
    if (active === "carrito") return <Carrito onCompraRealizada={refreshCartCount} onGoPedidos={() => setActive("pedidos")} />;
    if (active === "pedidos") return <MisPedidos />;
    if (active === "resenas") return <MisResenas />;
    if (active === "perfil") return <Perfil />;
    return <ComingSoon label={PAGE_TITLES[active]} />;
  };

  return (
    <div className="client-root">
      <Sidebar
        active={active}
        setActive={setActive}
        userName={userName}
        initials={initials}
        handleLogout={handleLogout}
      />
      <div className="main-area">
        <Topbar
          title={PAGE_TITLES[active]}
          cartCount={cartCount}
          setActive={setActive}
        />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>

      {cartLimitModal && (
        <div className="client-modal-overlay" onClick={() => setCartLimitModal(false)}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Límite de carrito</h4>
            <p>{cartErrorMessage}</p>
            <button className="cliente-primary-btn" onClick={() => setCartLimitModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}