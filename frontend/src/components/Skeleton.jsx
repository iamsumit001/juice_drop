export const ProductCardSkeleton = () => (
  <div className="product-card skeleton-card">
    <div className="skeleton skeleton-image" />
    <div className="product-card-body">
      <div className="skeleton skeleton-line" style={{ width: "40%" }} />
      <div className="skeleton skeleton-line" style={{ width: "70%", height: "18px" }} />
      <div className="skeleton skeleton-line" style={{ width: "90%" }} />
      <div className="skeleton skeleton-line" style={{ width: "30%" }} />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="product-grid">
    {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

export const RowSkeleton = ({ count = 4 }) => (
  <div className="skeleton-rows">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton skeleton-row" />
    ))}
  </div>
);
