import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Minus, Plus } from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import ProductImage from "../components/ProductImage";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productError, setProductError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: "5", title: "", comment: "" });
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data.product);
      setSize(res.data.product.sizes[0]);
      setProductError("");
    }).catch((err) => setProductError(err.response?.data?.message || "Couldn't load this juice."));
    api.get(`/products/${id}/reviews`)
      .then((res) => {
        setReviews(res.data.reviews);
        setReviewRating(res.data.rating);
        setReviewCount(res.data.reviewCount);
      })
      .catch(() => setReviewError("Couldn't load customer reviews."))
      .finally(() => setReviewLoading(false));
  }, [id, retryKey]);

  useEffect(() => {
    if (!user || !product) return;
    api.get(`/products/${id}/reviews/mine`)
      .then((res) => setMyReview(res.data.review))
      .catch(() => setReviewError("Couldn't check whether you have already reviewed this juice."));
  }, [user, product, id]);

  if (!product) {
    return productError
      ? <div className="section empty-state" role="alert"><h1>Juice details unavailable</h1><p>{productError}</p><button className="btn-primary" onClick={() => setRetryKey((previous) => previous + 1)}>Try again</button></div>
      : <div className="page-loading" role="status">Loading juice details…</div>;
  }

  const sizePricing = product.sizePrices?.find((variant) => variant.size === size)
    || { price: product.price, priceTiers: product.priceTiers || [] };
  const unitPrice = [...(sizePricing.priceTiers || [])]
    .filter((tier) => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0]?.unitPrice ?? sizePricing.price;

  const handleAdd = () => {
    addItem(product, size, quantity);
    showToast(`${product.name} added to cart`, "success");
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");
    try {
      const response = await api.post(`/products/${id}/reviews`, reviewForm);
      setReviews((previous) => [response.data.review, ...previous]);
      setReviewCount(response.data.reviewCount);
      setReviewRating(response.data.rating);
      setMyReview(response.data.review);
      showToast("Thanks for sharing your review!", "success");
    } catch (err) {
      const message = err.response?.data?.message || "Couldn't submit your review. Please try again.";
      setReviewError(message);
      showToast(message, "error");
    }
  };

  return (
    <div className="section product-details">
      <div className="product-details-grid">
        <ProductImage product={product} className="product-details-image" loading="eager" />
        <div className="product-details-info">
          <span className="product-card-category">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-card-rating" aria-label={`Rated ${Number(reviewRating || product.rating).toFixed(1)} out of 5`}>
            <Star size={16} fill="#f5a623" color="#f5a623" /> {Number(reviewRating || product.rating).toFixed(1)} ({reviewCount} reviews)
          </div>
          <p className="product-details-desc">{product.description}</p>

          <div className="product-details-row">
            <strong>Ingredients:</strong> {product.ingredients.join(", ")}
          </div>
          <div className="product-details-row">
            <strong>Calories:</strong> {product.calories} kcal
          </div>

          <div className="product-details-row">
            <strong>Size:</strong>
            <div className="size-options">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s === size ? "size-btn active" : "size-btn"}
                  aria-pressed={s === size}
                  onClick={() => setSize(s)}
                >
                  {s} — ₹{product.sizePrices?.find((variant) => variant.size === s)?.price ?? product.price}
                </button>
              ))}
            </div>
          </div>

          <div className="product-details-row">
            <strong>Quantity:</strong>
            <div className="qty-control">
              <button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={quantity >= product.stock} onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}><Plus size={16} /></button>
            </div>
          </div>

          <p className="selected-unit-price">₹{unitPrice} each · {size}</p>
          <div className="product-details-price" aria-live="polite">Total: ₹{unitPrice * quantity}</div>
          {sizePricing.priceTiers?.length > 0 && (
            <ul className="price-tier-list">
              {sizePricing.priceTiers
                .slice()
                .sort((a, b) => a.minQuantity - b.minQuantity)
                .map((tier) => (
                  <li key={tier.minQuantity}>Buy {tier.minQuantity}+ for ₹{tier.unitPrice} each</li>
                ))}
            </ul>
          )}

          <button className="btn-primary" disabled={product.stock === 0} onClick={handleAdd}>
            {product.stock === 0 ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
          </button>

          <Link to="/shop" className="btn-link">← Back to Shop</Link>
        </div>
      </div>
      <section className="product-reviews" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading">Customer reviews</h2>
        <p className="reviews-summary">Rated {Number(reviewRating || product.rating).toFixed(1)} out of 5 · {reviewCount} written {reviewCount === 1 ? "review" : "reviews"}</p>
        {user ? myReview ? (
          <div className="review-notice">You’ve already reviewed this juice. Thank you!</div>
        ) : (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>Share your experience</h3>
            {reviewError && <p className="form-error" role="alert">{reviewError}</p>}
            <label htmlFor="review-rating">Your rating</label>
            <select id="review-rating" value={reviewForm.rating} onChange={(event) => setReviewForm((previous) => ({ ...previous, rating: event.target.value }))}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} out of 5</option>)}
            </select>
            <label htmlFor="review-title">Review title</label>
            <input id="review-title" minLength="3" maxLength="100" value={reviewForm.title} onChange={(event) => setReviewForm((previous) => ({ ...previous, title: event.target.value }))} required />
            <label htmlFor="review-comment">Your review</label>
            <textarea id="review-comment" minLength="10" maxLength="1500" rows="4" value={reviewForm.comment} onChange={(event) => setReviewForm((previous) => ({ ...previous, comment: event.target.value }))} required />
            <button className="btn-primary" type="submit">Submit review</button>
          </form>
        ) : (
          <p className="review-notice"><Link to="/login">Sign in</Link> to leave a review.</p>
        )}
        {reviewError && !user && <p className="form-error" role="alert">{reviewError}</p>}
        {reviewLoading ? <p className="page-loading" role="status">Loading reviews…</p> : reviews.length ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <div className="review-card-heading">
                  <div><h3>{review.title}</h3><span>{review.user?.name || "JuiceDrop customer"}</span></div>
                  <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>No written reviews yet. Be the first to share your experience.</p></div>
        )}
      </section>
    </div>
  );
};

export default ProductDetails;
