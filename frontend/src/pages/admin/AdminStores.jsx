import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { RowSkeleton } from "../../components/Skeleton";

const emptyForm = {
  name: "",
  ownership: "company-owned",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  hours: "",
  mapUrl: "",
  active: true,
};

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { showToast } = useToast();

  const loadStores = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/stores/admin");
      setStores(res.data.stores);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Couldn't load stores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (store) => {
    setForm({
      name: store.name,
      ownership: store.ownership,
      description: store.description || "",
      address: store.address,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      phone: store.phone,
      email: store.email || "",
      hours: store.hours || "",
      mapUrl: store.mapUrl || "",
      active: store.active,
    });
    setEditingId(store._id);
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/stores/${editingId}`, form);
        showToast("Store updated", "success");
      } else {
        await api.post("/stores", form);
        showToast("Store added", "success");
      }
      setShowForm(false);
      await loadStores();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save store", "error");
    }
  };

  const handleDelete = async (store) => {
    if (!window.confirm(`Delete ${store.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/stores/${store._id}`);
      showToast("Store deleted", "success");
      await loadStores();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete store", "error");
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Stores</h1>
          <p>Manage company-owned and franchise locations.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Store</button>
      </div>

      {showForm && (
        <form className="admin-form store-admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit store" : "Add a store"}</h2>
          <div className="store-form-grid">
            <label>Store name<input name="name" value={form.name} onChange={handleChange} required /></label>
            <label>Ownership
              <select name="ownership" value={form.ownership} onChange={handleChange}>
                <option value="company-owned">Company-owned</option>
                <option value="franchise">Franchise</option>
              </select>
            </label>
            <label className="store-form-wide">Description<textarea name="description" value={form.description} onChange={handleChange} rows="2" /></label>
            <label className="store-form-wide">Street address<input name="address" value={form.address} onChange={handleChange} required /></label>
            <label>City<input name="city" value={form.city} onChange={handleChange} required /></label>
            <label>State<input name="state" value={form.state} onChange={handleChange} required /></label>
            <label>Postal code<input name="pincode" value={form.pincode} onChange={handleChange} required /></label>
            <label>Phone<input type="tel" name="phone" value={form.phone} onChange={handleChange} required /></label>
            <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} /></label>
            <label>Opening hours<input name="hours" value={form.hours} onChange={handleChange} placeholder="Daily, 9 AM – 9 PM" /></label>
            <label className="store-form-wide">Map link (optional)<input type="url" name="mapUrl" value={form.mapUrl} onChange={handleChange} placeholder="https://maps.google.com/..." /></label>
          </div>
          {editingId && (
            <label className="store-active-toggle">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
              Visible in the public store finder
            </label>
          )}
          <div className="form-row">
            <button className="btn-primary" type="submit">{editingId ? "Save Changes" : "Add Store"}</button>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <RowSkeleton count={5} />
      ) : loadError ? (
        <div className="empty-state">
          <h2>Couldn't load stores</h2>
          <p>{loadError}</p>
          <button className="btn-primary" onClick={loadStores}>Try again</button>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <MapPin size={34} />
          <h2>No stores added yet</h2>
          <p>Add your company-owned and franchise locations to show them in the public store finder.</p>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add your first store</button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table fade-in">
            <thead>
              <tr><th>Store</th><th>Type</th><th>Location</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store._id}>
                  <td>{store.name}</td>
                  <td>{store.ownership === "franchise" ? "Franchise" : "Company-owned"}</td>
                  <td>{store.city}, {store.state}</td>
                  <td>{store.phone}</td>
                  <td>{store.active ? <span className="badge-ok">Visible</span> : <span className="badge-out">Hidden</span>}</td>
                  <td>
                    <button className="btn-icon" aria-label={`Edit ${store.name}`} onClick={() => openEdit(store)}><Pencil size={16} /></button>
                    <button className="btn-icon" aria-label={`Delete ${store.name}`} onClick={() => handleDelete(store)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
