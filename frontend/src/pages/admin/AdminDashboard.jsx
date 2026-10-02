import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/orders"), api.get("/products")])
      .then(([o, p]) => {
        setOrders(o.data.orders);
        setProducts(p.data.products);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.user?._id)).size;
  const recentOrders = orders.slice(0, 5);

  const productSales = {};
  orders.forEach((o) => {
    o.items.forEach((i) => {
      productSales[i.name] = (productSales[i.name] || 0) + i.quantity;
    });
  });
  const popular = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><span>Total Revenue</span><strong>₹{totalRevenue}</strong></div>
        <div className="stat-card"><span>Total Orders</span><strong>{orders.length}</strong></div>
        <div className="stat-card"><span>Total Customers</span><strong>{uniqueCustomers}</strong></div>
        <div className="stat-card"><span>Total Products</span><strong>{products.length}</strong></div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-panel">
          <h3>Recent Orders</h3>
          {recentOrders.map((o) => (
            <div key={o._id} className="admin-list-row">
              <span>#{o._id.slice(-6).toUpperCase()}</span>
              <span>{o.user?.name}</span>
              <span>₹{o.total}</span>
              <span className={`status-pill status-${o.orderStatus.replace(/\s/g, "-").toLowerCase()}`}>{o.orderStatus}</span>
            </div>
          ))}
        </div>
        <div className="admin-panel">
          <h3>Popular Products</h3>
          {popular.map(([name, qty]) => (
            <div key={name} className="admin-list-row">
              <span>{name}</span>
              <span>{qty} sold</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
