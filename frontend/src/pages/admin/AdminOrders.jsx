import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { RowSkeleton } from "../../components/Skeleton";

const STATUSES = ["Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/orders").then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, orderStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { orderStatus });
      showToast(`Order status updated to "${orderStatus}"`, "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  if (loading) return <div><h1>Orders</h1><RowSkeleton count={6} /></div>;

  return (
    <div>
      <h1>Orders</h1>
      <table className="admin-table">
        <thead>
          <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-8).toUpperCase()}</td>
              <td>{o.user?.name}<br /><small>{o.user?.email}</small></td>
              <td>{o.items.length} item(s)</td>
              <td>₹{o.total}</td>
              <td>{o.paymentMethod} ({o.paymentStatus})</td>
              <td>
                <select value={o.orderStatus} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
