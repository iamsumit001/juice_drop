import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { RowSkeleton } from "../components/Skeleton";

const STEPS = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my")
      .then((res) => setOrders(res.data.orders))
      .catch(() => setError("Couldn't load your orders. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section"><h1>My Orders</h1><RowSkeleton count={3} /></div>;

  if (error) {
    return (
      <div className="section empty-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="section empty-state">
        <h2>No orders yet</h2>
        <p>Your fresh juices are just a few clicks away.</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="section">
      <h1>My Orders</h1>
      <div className="orders-list fade-in">
        {orders.map((order) => {
          const stepIndex = STEPS.indexOf(order.orderStatus);
          return (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <span className={`status-pill status-${order.orderStatus.replace(/\s/g, "-").toLowerCase()}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.name} ({item.size}) × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {order.orderStatus !== "Cancelled" && (
                <div className="tracking-bar">
                  {STEPS.map((step, idx) => (
                    <div key={step} className={`tracking-step ${idx <= stepIndex ? "active" : ""}`}>
                      <div className="tracking-dot" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="order-card-footer">
                <span>Payment: {order.paymentMethod} ({order.paymentStatus})</span>
                <strong>Total: ₹{order.total}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
