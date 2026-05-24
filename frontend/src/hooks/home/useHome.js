import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";

const API_BASE = "https://beautyshop-production.up.railway.app";

export const useHome = () => {
  const navigate = useNavigate();
  const [search,      setSearch]   = useState("");
  const [activeFilter,setFilter]   = useState("Todos");
  const [toast,       setToast]    = useState(null);
  const [products,    setProducts] = useState([]);
  const [categories,  setCategories] = useState(["Todos"]);
  const [loading,     setLoading]  = useState(true);
  const [stats,       setStats]    = useState(null); // real stats from backend

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prods, cats, homeStats] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
          fetch(`${API_BASE}/api/reportes/home-stats`).then(r => r.json()).catch(() => null),
        ]);

        const activos = prods
          .filter(p => p.estado === 'activo')
          .map(p => ({
            id:     p.id_producto,
            name:   p.nombre,
            cat:    p.nombre_categoria || "Sin categoría",
            price:  p.precio > 0 ? Math.round(p.precio) : 0,
            desc:   p.descripcion || "",
            stock:  p.stock || 0,
            imagen: p.imagenes && p.imagenes.length > 0
              ? `${API_BASE}${p.imagenes[0]}`
              : null,
            stars:   4,
            reviews: 0,
            badge:   null,
          }));

        setProducts(activos);
        setCategories(["Todos", ...cats.map(c => c.nombre)]);
        if (homeStats && !homeStats.error) setStats(homeStats);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = products.filter(p => {
    const matchCat    = activeFilter === "Todos" || p.cat === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.cat.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = () => navigate("/login");

  return {
    search, setSearch,
    activeFilter, setFilter,
    toast, setToast,
    filtered,
    categories,
    loading,
    stats,
    addToCart,
    navigate,
  };
};
