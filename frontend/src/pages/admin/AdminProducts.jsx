import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { RowSkeleton } from "../../components/Skeleton";

const emptyVariant = () => ({ size: "", price: "", priceTiersText: "" });

const emptyForm = {
  name: "", description: "", category: "Fresh Juices", image: "",
  ingredients: "", calories: "", stock: "",
  sizePrices: [{ size: "250ml", price: "", priceTiersText: "" }, { size: "500ml", price: "", priceTiersText: "" }],
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/products").then((res) => setProducts(res.data.products)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, category: p.category,
      image: p.image, ingredients: p.ingredients.join(", "), calories: p.calories,
      stock: p.stock,
      sizePrices: p.sizes.map((size, index) => {
        const variant = p.sizePrices?.find((entry) => entry.size === size);
        const legacyPrice = index === 0 ? p.price : Math.round(p.price * 1.5);
        const tiers = variant?.priceTiers || (index === 0 ? p.priceTiers : []);
        return {
          size,
          price: String(variant?.price ?? legacyPrice),
          priceTiersText: (tiers || []).map((tier) => `${tier.minQuantity}:${tier.unitPrice}`).join(", "),
        };
      }),
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.sizePrices[0]?.price),
      calories: Number(form.calories),
      stock: Number(form.stock),
      sizes: form.sizePrices.map((variant) => variant.size.trim()),
      sizePrices: form.sizePrices.map((variant) => ({
        size: variant.size.trim(),
        price: Number(variant.price),
        priceTiers: variant.priceTiersText.split(",").map((tier) => tier.trim()).filter(Boolean).map((tier) => {
          const [minQuantity, unitPrice] = tier.split(":").map((part) => Number(part.trim()));
          return { minQuantity, unitPrice };
        }),
      })),
      ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast("Product updated", "success");
      } else {
        await api.post("/products", payload);
        showToast("Product created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save product", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      showToast("Product deleted", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete product", "error");
    }
  };

  const stockLabel = (stock) => {
    if (stock === 0) return <span className="badge-out">Out of Stock</span>;
    if (stock < 10) return <span className="badge-low">Low Stock</span>;
    return <span className="badge-ok">Available</span>;
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1>Products</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> New Product</button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
          </div>
          <div className="price-tier-editor">
            <div className="price-tier-editor-header">
              <div>
                <strong>Size prices and quantity tiers</strong>
                <span>Set a separate base price for every size. Optional tiers use quantity:unit-price pairs (for example, 3:120, 5:110).</span>
              </div>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setForm((previous) => ({
                  ...previous,
                  sizePrices: [...previous.sizePrices, emptyVariant()],
                }))}
              >
                <Plus size={15} /> Add size
              </button>
            </div>
            {form.sizePrices.map((variant, index) => (
              <div className="form-row price-tier-row" key={index}>
                <div>
                  <label htmlFor={`variant-size-${index}`}>Size</label>
                  <input id={`variant-size-${index}`} value={variant.size} onChange={(event) => setForm((previous) => ({
                    ...previous,
                    sizePrices: previous.sizePrices.map((current, variantIndex) => (
                      variantIndex === index ? { ...current, size: event.target.value } : current
                    )),
                  }))} required />
                </div>
                <div>
                  <label htmlFor={`variant-price-${index}`}>Unit price (₹)</label>
                  <input id={`variant-price-${index}`} type="number" min="0" step="0.01" value={variant.price} onChange={(event) => setForm((previous) => ({
                    ...previous,
                    sizePrices: previous.sizePrices.map((current, variantIndex) => (
                      variantIndex === index ? { ...current, price: event.target.value } : current
                    )),
                  }))} required />
                </div>
                <div className="price-tier-input">
                  <label htmlFor={`variant-tiers-${index}`}>Optional bulk tiers</label>
                  <input id={`variant-tiers-${index}`} value={variant.priceTiersText} placeholder="3:120, 5:110" onChange={(event) => setForm((previous) => ({
                    ...previous,
                    sizePrices: previous.sizePrices.map((current, variantIndex) => (
                      variantIndex === index ? { ...current, priceTiersText: event.target.value } : current
                    )),
                  }))} />
                </div>
                {form.sizePrices.length > 1 && (
                  <button className="btn-icon" type="button" aria-label={`Remove ${variant.size || "size"} pricing`} onClick={() => setForm((previous) => ({
                    ...previous,
                    sizePrices: previous.sizePrices.filter((_, variantIndex) => variantIndex !== index),
                  }))}>
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <label>Description</label>
          <input name="description" value={form.description} onChange={handleChange} required />
          <div className="form-row">
            <div>
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {["Fresh Juices", "Cold Pressed", "Smoothies", "Detox", "Protein", "Seasonal"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label>Calories</label><input type="number" name="calories" value={form.calories} onChange={handleChange} /></div>
            <div><label>Stock</label><input type="number" name="stock" value={form.stock} onChange={handleChange} required /></div>
          </div>
          <label>Image URL</label>
          <input name="image" value={form.image} onChange={handleChange} />
          <label>Ingredients (comma separated)</label>
          <input name="ingredients" value={form.ingredients} onChange={handleChange} />
          <div className="form-row">
            <button className="btn-primary" type="submit">{editingId ? "Update" : "Create"} Product</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <RowSkeleton count={6} />
      ) : (
        <table className="admin-table fade-in">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.sizePrices?.length ? `${p.sizePrices.map((variant) => `${variant.size}: ₹${variant.price}`).join(" · ")}` : `₹${p.price}`}</td>
                <td>{p.stock}</td>
                <td>{stockLabel(p.stock)}</td>
                <td>
                  <button className="btn-icon" aria-label={`Edit ${p.name}`} onClick={() => openEdit(p)}><Pencil size={16} /></button>
                  <button className="btn-icon" aria-label={`Delete ${p.name}`} onClick={() => handleDelete(p._id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProducts;
