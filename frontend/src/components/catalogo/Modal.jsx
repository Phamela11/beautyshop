import { useState, useEffect } from "react";
import { Ic } from "../../data/catalogoData";
import StarRow from "../global/StarRow";
import { productService } from "../../services/productService";
import { getAssetUrl } from "../../services/apiConfig";

const fmt = (n) => `$${n.toLocaleString('es-CO')}`;

const Modal = ({ product, onClose, addToCart, adminView = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [, setReviewsError] = useState(null);

  const images = product.imagenes || [];
  const currentImage = images[activeIndex] || null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    let isCancelled = false;

    const loadReviews = async () => {
      setLoadingReviews(true);
      setReviewsError(null);
      try {
        const data = await productService.getResenasProducto(product.id);
        if (!isCancelled) {
          setReviews(data.resenas || []);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error al cargar reseñas del producto:', error);
          setReviewsError('No se pudieron cargar las reseñas');
          setReviews([]);
        }
      } finally {
        if (!isCancelled) {
          setLoadingReviews(false);
        }
      }
    };

    if (product?.id) {
      loadReviews();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReviews([]);
      setLoadingReviews(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [product.id]);

  const averageRating = reviews.length
    ? Math.round(reviews.reduce((sum, item) => sum + Number(item.calificacion || 0), 0) / reviews.length)
    : Math.round(product.stars || 0);

  const formatReviewDate = (value) => {
    try {
      return new Date(value).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-gallery">
          {currentImage ? (
            <img
              src={getAssetUrl(currentImage)}
              alt={`${product.name} imagen ${activeIndex + 1}`}
              className="modal-image"
            />
          ) : (
            Ic.lipstick
          )}
          {images.length > 1 && (
            <div className="gallery-pagination">
              <button type="button" className="gallery-arrow" onClick={handlePrev}>‹</button>
              <span className="gallery-page">{activeIndex + 1} / {images.length}</span>
              <button type="button" className="gallery-arrow" onClick={handleNext}>›</button>
            </div>
          )}
        </div>
        <div className="modal-body">
          <div className="modal-cat">{product.cat}</div>
          <div className="modal-name">{product.name}</div>
          <StarRow stars={product.stars} reviews={product.reviews} />
          <div className="modal-desc">{product.desc}</div>
          <div className="modal-price">
            {fmt(product.price)}
            {product.old && <span style={{fontSize:13,color:'#b09aa0',textDecoration:'line-through',marginLeft:8,fontWeight:400}}>{fmt(product.old)}</span>}
          </div>

          <div className="modal-reviews">
            <div className="modal-reviews-header">
              <div className="reviews-title">Reseñas</div>
              <div className="reviews-summary">
                <StarRow stars={averageRating} reviews={reviews.length} />
                <span className="reviews-count">
                  {reviews.length > 0 ? `${reviews.length} comentario${reviews.length === 1 ? '' : 's'}` : 'Sin comentarios aún'}
                </span>
              </div>
            </div>

            {loadingReviews ? (
              <p className="reviews-loading">Cargando reseñas...</p>
            ) : reviews.length === 0 ? (
              <p className="reviews-empty">Aún no hay comentarios para este producto.</p>
            ) : (
              <div className="review-list">
                {reviews.map((review) => (
                  <div key={review.id_resena} className="review-item">
                    <div className="review-meta">
                      <strong>{review.nombre_usuario || 'Cliente'}</strong>
                      <span>{formatReviewDate(review.fecha)}</span>
                    </div>
                    <StarRow stars={Number(review.calificacion) || 0} reviews={0} />
                    <p className="review-text">
                      {review.comentario ? review.comentario : 'Sin comentario adicional.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((imagen, index) => (
                <button
                  key={index}
                  type="button"
                  className={`thumbnail-item ${index === activeIndex ? 'active-thumb' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img
                    src={getAssetUrl(imagen)}
                    alt={`Miniatura ${index + 1}`}
                    className="thumbnail-image"
                  />
                </button>
              ))}
            </div>
          )}
          <div className="modal-stock">
            Disponible: <span>{product.stock} unidades</span>
          </div>
          <div className="modal-actions">
            {!adminView && (
              <button className="modal-btn-cart" onClick={() => addToCart(product)}>
                Agregar al carrito
              </button>
            )}
            <button className="modal-btn-close" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
