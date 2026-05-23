import { Ic } from "../../data/catalogoData";
import StarRow from "../global/StarRow";
import { getAssetUrl } from "../../services/apiConfig";

const fmt = (n) => `$${n.toLocaleString('es-CO')}`;

const ProductCard = ({ product, onClick, liked, toggleLike, addToCart, showAddToCart = true }) => (
  <div className="product-card" onClick={onClick}>
    <div className="product-img">
      {product.imagenes && product.imagenes.length > 0 ? (
        <img
          src={getAssetUrl(product.imagenes[0])}
          alt={product.name}
          className="product-image"
        />
      ) : (
        Ic.lipstick
      )}
      {product.imagenes && product.imagenes.length > 1 && (
        <span className="product-gallery-count">{product.imagenes.length} imágenes</span>
      )}
      {product.badge && (
        <span className={`product-badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
      )}
      <button
        className={`wishlist-btn${liked[product.id] ? " liked" : ""}`}
        onClick={e => toggleLike(product.id, e)}
      >
        {Ic.heart}
      </button>
    </div>
    <div className="product-info">
      <div className="product-cat">{product.cat}</div>
      <div className="product-name">{product.name}</div>
      <StarRow stars={product.stars} reviews={product.reviews} />
      <div className="product-footer">
        <div>
          {product.stock > 0 && product.price > 0 ? (
            <>
              <span className="product-price">{fmt(product.price)}</span>
              {product.old && <span className="product-old">{fmt(product.old)}</span>}
            </>
          ) : (
            <span style={{fontSize:11,fontWeight:700,color:'#c9536a',background:'#fdf0f2',border:'1px solid #f0c0ca',padding:'2px 10px',borderRadius:20,letterSpacing:'0.06em',textTransform:'uppercase'}}>
              Agotado
            </span>
          )}
        </div>
        <div className="card-actions">
          <button className="btn-detail" onClick={e => { e.stopPropagation(); onClick(); }} title="Ver detalle">
            {Ic.eye}
          </button>
          {showAddToCart && product.stock > 0 && product.price > 0 && (
            <button className="btn-cart" onClick={e => { e.stopPropagation(); addToCart(product); }} title="Agregar al carrito">
              {Ic.plus}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ProductCard;
