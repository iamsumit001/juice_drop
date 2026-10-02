import { Link } from "react-router-dom";
import { Star, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ProductImage from "./ProductImage";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-image">
        <ProductImage product={product} />
        {product.stock === 0 && <span className="badge-out">Out of Stock</span>}
      </Link>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <Link to={`/product/${product._id}`}><h3>{product.name}</h3></Link>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-rating">
          <Star size={14} fill="#f5a623" color="#f5a623" /> {product.rating.toFixed(1)}
        </div>
        <div className="product-card-footer">
          <span className="product-card-price">
            ₹{product.sizePrices?.[0]?.price ?? product.price}
            {product.sizePrices?.[0]?.size && <small> / {product.sizePrices[0].size}</small>}
          </span>
          <button
            className="btn-add-cart"
            disabled={product.stock === 0}
            onClick={() => {
              addItem(product, product.sizePrices?.[0]?.size || product.sizes[0], 1);
              showToast(`${product.name} added to cart`, "success");
            }}
          >
            <Plus size={16} /> Add
          </button>
        </div>
        {product.sizePrices?.some((variant) => variant.priceTiers?.length > 0) && (
          <p className="product-card-bulk-price">
            Bulk price from ₹{Math.min(...product.sizePrices.flatMap((variant) => (variant.priceTiers || []).map((tier) => tier.unitPrice)))} each
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
