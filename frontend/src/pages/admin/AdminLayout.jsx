import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { Ic } from "../../data/adminData";
import { productService } from "../../services/productService";
import Sidebar from "../../components/admin/Sidebar";
import Dashboard from "../../components/admin/Dashboard";
import ComingSoon from "../../components/admin/ComingSoon";
import Producto from "../producto/Producto";
import Catalogo from "../catalogo/Catalogo";
import Categoria from "../categoria/Categoria";
import Proveedor from "../proveedor/Proveedor";
import Compra from "../compra/Compra";
import Inventario from "../inventario/Inventario";
import Pedido from "../pedido/Pedido";
import Envio from "../envio/envio";
import Usuarios from "./Usuarios";
import Reportes from "../reporte/Reportes";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [pedidosPendientes, setPedidosPendientes] = useState(0);

  const {
    active,
    setActive,
    userName,
    initials,
    PAGE_TITLES,
    handleLogout,
    sections,
    NAV,
  } = useAdmin();

  const cargarPedidosPendientes = useCallback(async () => {
    try {
      const pedidos = await productService.getPedidos();
      setPedidosPendientes(pedidos.filter(p => p.estado === "pendiente").length);
    } catch {
      setPedidosPendientes(0);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPedidosPendientes();
  }, [cargarPedidosPendientes]);

  const renderPage = () => {
    if (active === "dashboard") return <Dashboard onNavigate={setActive} />;
    if (active === "productos") return <Producto />;
    if (active === "catalogo") return <Catalogo onAddToCart={() => {}} adminView />;
    if (active === "categorias") return <Categoria />;
    if (active === "proveedores") return <Proveedor />;
    if (active === "compras") return <Compra />;
    if (active === "inventario") return <Inventario />;
    if (active === "pedidos") return <Pedido />;
    if (active === "envios") return <Envio />;
    if (active === "usuarios") return <Usuarios />;
    if (active === "reportes") return <Reportes />;
    return <ComingSoon label={PAGE_TITLES[active]} />;
  };

  return (
    <>
      <div className="admin-root">
        <Sidebar
          active={active}
          setActive={setActive}
          userName={userName}
          initials={initials}
          sections={sections}
          NAV={NAV}
          handleLogout={handleLogout}
        />

        <div className="main-area">
          <header className="topbar">
            <div className="topbar-left">
              <span className="topbar-title">{PAGE_TITLES[active]}</span>
            </div>
            <div className="topbar-right">
              <button
                className="topbar-btn"
                onClick={() => setActive("pedidos")}
                title={pedidosPendientes > 0 ? `${pedidosPendientes} pedidos pendientes` : "Sin pedidos pendientes"}
                aria-label={pedidosPendientes > 0 ? `${pedidosPendientes} pedidos pendientes` : "Sin pedidos pendientes"}
              >
                {Ic.bell}
                {pedidosPendientes > 0 && (
                  <span className="topbar-count">{pedidosPendientes}</span>
                )}
              </button>
            </div>
          </header>

          <main className="page-content">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}
