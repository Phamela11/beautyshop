const PromoBanner = ({ navigate }) => {
  return (
    <div className="promo-banner">
      <div className="promo-content">
        <span className="promo-tag">Oferta especial</span>
        <div className="promo-title">Crea tu cuenta y obtén 10% de descuento</div>
        <div className="promo-sub">En tu primera compra. Envio gratis en pedidos mayores a $80.000</div>
      </div>
      <button className="promo-btn" onClick={() => navigate("/register")}>
        Registrarme ahora
      </button>
    </div>
  );
};

export default PromoBanner;