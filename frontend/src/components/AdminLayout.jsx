import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Users, LogOut, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>JuiceDrop Admin</h2>
        <NavLink to="/admin" end><LayoutDashboard size={18} /> Dashboard</NavLink>
        <NavLink to="/admin/products"><Package size={18} /> Products</NavLink>
        <NavLink to="/admin/orders"><ClipboardList size={18} /> Orders</NavLink>
        <NavLink to="/admin/users"><Users size={18} /> Customers</NavLink>
        <NavLink to="/admin/stores"><MapPin size={18} /> Stores</NavLink>
        <button className="admin-logout" onClick={() => { logout(); navigate("/"); }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
