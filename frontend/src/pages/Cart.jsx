import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Cart = () => {
  const { items, updateQuantity, removeItem, subtotal, discount, deliveryFee, tax, total, coupon, applyCoupon, removeCoupon, getUnitPrice } = useCart();
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCoupon = () => {
    if (applyCoupon(code)) {
      setCouponMsg("Coupon applied! 10% off.");
      showToast("Coupon applied — 10% off!", "success");
    } else {
      setCouponMsg("Invalid coupon code.");
      showToast("Invalid coupon code", "error");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="section empty-state">
        <h2>Your cart is empty</h2>
        <p>Add some fresh juices to get started.</p>
        <Link to="/shop" className="btn-primary">Browse Juices</Link>
      </div>
    );
  }

  return (
    <div className="section cart-page">
      <h1>Your Cart</h1>
      <div className="cart-grid fade-in">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.key} className="cart-item">
              <img
                src={item.image || "/images/products/juice-fallback.svg"}
                alt={`${item.name}, ${item.size}`}
                onError={(event) => { event.currentTarget.src = "/images/products/juice-fallback.svg"; }}
              />
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <span>{item.size}</span>
                <div className="qty-control">
                  <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="cart-item-price">
                ₹{getUnitPrice(item, item.quantity) * item.quantity}
                {getUnitPrice(item, item.quantity) < item.price && (
                  <span className="cart-unit-price">₹{getUnitPrice(item, item.quantity)} each</span>
                )}
              </div>
              <button className="btn-icon" aria-label={`Remove ${item.name} from cart`} onClick={() => removeItem(item.key)}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="coupon-row">
            <label className="sr-only" htmlFor="cart-coupon">Coupon code</label>
            <input id="cart-coupon" placeholder="Coupon code (JUICE10)" value={code} onChange={(e) => setCode(e.target.value)} />
            {coupon ? (
              <button type="button" onClick={removeCoupon}>Remove</button>
            ) : (
              <button type="button" onClick={handleCoupon}>Apply</button>
            )}
          </div>
          {couponMsg && <p className="coupon-msg">{couponMsg}</p>}

          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
          {discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-₹{Math.round(discount)}</span></div>}
          <div className="summary-row"><span>Delivery Fee</span><span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>₹{tax}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>

          {subtotal < 299 && <p className="delivery-note">Add ₹{299 - subtotal} more for FREE delivery</p>}

          <button className="btn-primary full-width" type="button" onClick={handleCheckout}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
