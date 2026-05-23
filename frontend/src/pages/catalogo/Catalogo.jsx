import { useCatalogo } from "../../hooks/useCatalogo";
import { Ic } from "../../data/catalogoData";
import Sidebar from "../../components/catalogo/Sidebar";
import ProductGrid from "../../components/catalogo/ProductGrid";
import Modal from "../../components/catalogo/Modal";
import Toast from "../../components/global/Toast";
import "./Catalogo.css";

export default function Catalogo({ onAddToCart, adminView = false }) {
  const {
    search,
    setSearch,
    catActiva,
    setCat,
    categorias,
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
    productos,
    addToCart,
    toggleLike,
  } = useCatalogo(onAddToCart, adminView);

  return (
    <>
      <div className="catalogo-root">
        <Sidebar
          catActiva={catActiva}
          setCat={setCat}
          categorias={categorias}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          applyPriceFilter={applyPriceFilter}
        />

        <div className="catalogo-main">
          <div className="catalogo-header">
            <div className="catalogo-search">
              <span className="search-ico">{Ic.search}</span>
              <input
                placeholder="Buscar productos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
              {adminView && <option value="reseñas-recientes">Últimas reseñas</option>}
              {adminView && <option value="reseñas-bajas">Reseñas más bajas</option>}
            </select>
            <span className="catalogo-info">{productos.length} productos</span>
          </div>

          <ProductGrid
            productos={productos}
            setModal={setModal}
            liked={liked}
            toggleLike={toggleLike}
            addToCart={addToCart}
            showAddToCart={!adminView}
          />
        </div>
      </div>

      {modal && (
        <Modal
          product={modal}
          onClose={() => setModal(null)}
          addToCart={addToCart}
          adminView={adminView}
        />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}
