import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">JuiceDrop</Link>

        <nav id="primary-navigation" className={`navbar-links ${open ? "open" : ""}`}>
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setOpen(false)}>Shop</Link>
          <Link to="/build-a-box" onClick={() => setOpen(false)}>Build a Box</Link>
          <Link to="/delivery" onClick={() => setOpen(false)}>Delivery</Link>
          <Link to="/stores" onClick={() => setOpen(false)}>Our Stores</Link>
          {user && <Link to="/orders" onClick={() => setOpen(false)}>Orders</Link>}
          {user?.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
        </nav>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-cart" aria-label={`Shopping cart, ${itemCount} items`}>
            <ShoppingCart size={22} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          {user ? (
            <div className="navbar-user">
              <Link to="/profile"><User size={20} /> {user.name.split(" ")[0]}</Link>
              <button type="button" onClick={handleLogout} className="btn-link">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary-sm">Login</Link>
          )}
          <button
            className="navbar-toggle"
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="primary-navigation"
            aria-expanded={open}
            onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
