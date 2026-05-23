import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";

export const useClient = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [cartCount, setCartCount] = useState(0);
  const [cartLimitModal, setCartLimitModal] = useState(false);
  const [cartErrorMessage, setCartErrorMessage] = useState("");

  const userName = localStorage.getItem("userName") || "Usuario";
  const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const PAGE_TITLES = {
    dashboard: "Inicio",
    catalogo: "Catalogo de productos",
    carrito: "Mi carrito",
    pedidos: "Mis pedidos",
    resenas: "Mis reseñas",
    perfil: "Mi perfil",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const refreshCartCount = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const carrito = await productService.getCarrito(userId);
      setCartCount(Number(carrito.total_productos || 0));
    } catch (error) {
      console.error("Error refrescando carrito:", error);
    }
  };

  const addToCart = async (product) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setCartErrorMessage("Debes iniciar sesión para agregar productos al carrito.");
      setCartLimitModal(true);
      return;
    }

    try {
      const result = await productService.addToCarrito(userId, product.id, 1);
      setCartCount(Number(result.total_productos || 0));
    } catch (error) {
      setCartErrorMessage(error.message || "No se pudo agregar al carrito.");
      setCartLimitModal(true);
    }
  };

  return {
    active,
    setActive,
    cartCount,
    setCartCount,
    userName,
    initials,
    PAGE_TITLES,
    handleLogout,
    addToCart,
    refreshCartCount,
    cartLimitModal,
    setCartLimitModal,
    cartErrorMessage,
    navigate,
  };
};