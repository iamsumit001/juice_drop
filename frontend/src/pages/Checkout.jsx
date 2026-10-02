import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const Checkout = () => {
  const { items, subtotal, discount, deliveryFee, tax, total, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    house: user?.address?.house || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
        shippingAddress: form,
        paymentMethod,
        couponCode: coupon,
      });
      setPlacedOrder(res.data.order);
      clearCart();
      showToast("Order placed successfully!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="section empty-state">
        <h1>Order Placed Successfully 🎉</h1>
        <p>Order ID: <strong>{placedOrder._id}</strong></p>
        <p>Total: ₹{placedOrder.total}</p>
        <button className="btn-primary" onClick={() => navigate("/orders")}>View Orders</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section empty-state">
        <h2>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => navigate("/shop")}>Browse Juices</button>
      </div>
    );
  }

  return (
    <div className="section checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h3>Delivery Address</h3>
          {error && <div className="form-error">{error}</div>}
          <label htmlFor="checkout-name">Name</label>
          <input id="checkout-name" autoComplete="name" name="name" value={form.name} onChange={handleChange} required />
          <label htmlFor="checkout-phone">Phone</label>
          <input id="checkout-phone" autoComplete="tel" type="tel" name="phone" value={form.phone} onChange={handleChange} required />
          <label htmlFor="checkout-email">Email</label>
          <input id="checkout-email" autoComplete="email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <label htmlFor="checkout-house">House / Flat</label>
          <input id="checkout-house" autoComplete="address-line1" name="house" value={form.house} onChange={handleChange} required />
          <label htmlFor="checkout-street">Street</label>
          <input id="checkout-street" autoComplete="address-line2" name="street" value={form.street} onChange={handleChange} required />
          <div className="form-row">
            <div>
              <label htmlFor="checkout-city">City</label>
              <input id="checkout-city" autoComplete="address-level2" name="city" value={form.city} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="checkout-state">State</label>
              <input id="checkout-state" autoComplete="address-level1" name="state" value={form.state} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="checkout-pincode">Pincode</label>
              <input id="checkout-pincode" autoComplete="postal-code" name="pincode" value={form.pincode} onChange={handleChange} required />
            </div>
          </div>

          <h3>Payment Method</h3>
          <div className="payment-options">
            <label className={paymentMethod === "COD" ? "payment-option active" : "payment-option"}>
              <input type="radio" name="paymentMethod" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} /> Cash on Delivery
            </label>
            <label className={paymentMethod === "Online" ? "payment-option active" : "payment-option"}>
              <input type="radio" name="paymentMethod" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} /> Mock Online Payment
            </label>
          </div>

          <button className="btn-primary full-width" type="submit" disabled={placing}>
            {placing ? "Placing order..." : `Place Order — ₹${total}`}
          </button>
        </form>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
          {discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-₹{Math.round(discount)}</span></div>}
          <div className="summary-row"><span>Delivery Fee</span><span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>₹{tax}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
