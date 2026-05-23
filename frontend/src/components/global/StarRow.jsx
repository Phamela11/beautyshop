const StarRow = ({ stars, reviews }) => (
  <div className="product-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} viewBox="0 0 24 24" className={i <= stars ? "star-on" : "star-off"}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
    <span className="star-count">({reviews})</span>
  </div>
);

export default StarRow;