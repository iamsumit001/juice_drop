import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      showToast(`Welcome to JuiceDrop, ${user.name.split(" ")[0]}!`, "success");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join JuiceDrop today</p>
        {error && <div className="form-error">{error}</div>}
        <label htmlFor="register-name">Name</label>
        <input id="register-name" autoComplete="name" name="name" value={form.name} onChange={handleChange} required />
        <label htmlFor="register-email">Email</label>
        <input id="register-email" autoComplete="email" type="email" name="email" value={form.email} onChange={handleChange} required />
        <label htmlFor="register-phone">Phone</label>
        <input id="register-phone" autoComplete="tel" type="tel" name="phone" value={form.phone} onChange={handleChange} />
        <label htmlFor="register-password">Password</label>
        <input id="register-password" autoComplete="new-password" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
