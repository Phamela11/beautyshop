import { Ic } from "../../data/catalogoData";
import ProductCard from "./ProductCard";

const ProductGrid = ({ productos, setModal, liked, toggleLike, addToCart, showAddToCart = true }) => (
  <div className="product-grid">
    {productos.length === 0 ? (
      <div className="empty-state">
        {Ic.box}
        <p>No se encontraron productos</p>
      </div>
    ) : productos.map(p => (
      <ProductCard
        key={p.id}
        product={p}
        onClick={() => setModal(p)}
        liked={liked}
        toggleLike={toggleLike}
        addToCart={addToCart}
        showAddToCart={showAddToCart}
      />
    ))}
  </div>
);

export default ProductGrid;