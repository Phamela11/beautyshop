import { useState, useEffect } from "react";
import { productService } from "../services/productService";

export const useCatalogo = (onAddToCart, adminView = false) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catActiva, setCat] = useState("Todos");
  const [sort, setSort] = useState("default");
  const [liked, setLiked] = useState({});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceFilter, setPriceF] = useState(null);
  const [categorias, setCategorias] = useState([{ name: 'Todos', count: 0 }]);

  const fetchProductos = async () => {
    try {
      const [data, cats] = await Promise.all([
        productService.getProducts(),
        productService.getCategories().catch(() => []),
      ]);

      const catList = [{ name: 'Todos', count: 0 }];
      for (const cat of cats) {
        const count = data.filter(p => p.nombre_categoria === cat.nombre && p.estado === 'activo').length;
        catList.push({ name: cat.nombre, count });
      }
      setCategorias(catList);

      // Mapear datos del backend al formato esperado
      let mappedProductos = data
        .filter(p => p.estado === 'activo')
        .map(p => ({
          id: p.id_producto,
          name: p.nombre,
          desc: p.descripcion,
          price: parseFloat(p.precio || 0), // Precio calculado desde backend
          stock: p.stock || 0, // Stock calculado desde backend
          cat: p.nombre_categoria || "General",
          imagenes: p.imagenes,
          stars: 4.5, // Valor por defecto
          reviews: 0,
          lastReviewDate: null,
          margen_ganancia: p.margen_ganancia,
          estado: p.estado
        }));

      if (adminView && mappedProductos.length > 0) {
        const reviewStats = await Promise.allSettled(
          mappedProductos.map(async (producto) => {
            const response = await productService.getResenasProducto(producto.id);
            const resenas = response?.resenas || [];
            const average = resenas.length
              ? Math.round(resenas.reduce((sum, item) => sum + Number(item.calificacion || 0), 0) / resenas.length)
              : 0;
            const lastReviewDate = resenas.length ? new Date(resenas[0].fecha).getTime() : null;
            return {
    categorias,
              ...producto,
              stars: average || producto.stars,
              reviews: resenas.length,
              lastReviewDate,
            };
          })
        );

        mappedProductos = reviewStats.map((result, index) =>
          result.status === 'fulfilled' ? result.value : mappedProductos[index]
        );
      }

      setProductos(mappedProductos);
    } catch (error) {
      console.error('Error fetching productos:', error);
      setToast('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (p) => {
    if (onAddToCart) onAddToCart(p);
    showToast(`${p.name} agregado al carrito`);
    setModal(null);
  };

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const applyPriceFilter = () => {
    setPriceF({
      min: minPrice ? Number(minPrice) : null,
      max: maxPrice ? Number(maxPrice) : null,
    });
  };

  let filteredProductos = productos.filter(p => {
    const matchCat = catActiva === "Todos" || p.cat === catActiva;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPrice = !priceFilter ||
      ((!priceFilter.min || p.price >= priceFilter.min) &&
       (!priceFilter.max || p.price <= priceFilter.max));
    return matchCat && matchSearch && matchPrice;
  });

  if (sort === "precio-asc") filteredProductos = [...filteredProductos].sort((a, b) => a.price - b.price);
  if (sort === "precio-desc") filteredProductos = [...filteredProductos].sort((a, b) => b.price - a.price);
  if (sort === "nombre") filteredProductos = [...filteredProductos].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "reseñas-recientes") filteredProductos = [...filteredProductos].sort((a, b) => (b.lastReviewDate || 0) - (a.lastReviewDate || 0));
  if (sort === "reseñas-bajas") filteredProductos = [...filteredProductos].sort((a, b) => (a.stars || 0) - (b.stars || 0));

  return {
    categorias,
    productos: filteredProductos,
    loading,
    search,
    setSearch,
    catActiva,
    setCat,
    sort,
    setSort,
    liked,
    modal,
    setModal,
    toast,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    applyPriceFilter,
    addToCart,
    toggleLike,
  };
};