import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ProductImage from "../components/ProductImage";
import { ProductGridSkeleton } from "../components/Skeleton";

const firstPrice = (product, size) => product.sizePrices?.find((variant) => variant.size === size)?.price ?? product.price;

const BuildJuiceBox = () => {
  const [products, setProducts] = useState([]);
  const [selections, setSelections] = useState([]);
  const [boxSize, setBoxSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get("/products"), api.get("/delivery/config")])
      .then(([productResponse, configResponse]) => {
        const available = productResponse.data.products.filter((product) => product.stock > 0);
        const configuredSize = configResponse.data.juiceBoxSize;
        setProducts(available);
        setBoxSize(configuredSize);
        setSelections(Array.from({ length: configuredSize }, () => ({ productId: "", size: "" })));
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load the juice box options. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const selectedProducts = useMemo(
    () => selections.map((selection) => products.find((product) => product._id === selection.productId)).filter(Boolean),
    [selections, products]
  );
  const subtotal = selections.reduce((sum, selection) => {
    const product = products.find((entry) => entry._id === selection.productId);
    return product ? sum + firstPrice(product, selection.size) : sum;
  }, 0);
  const complete = selections.length > 0 && selections.every((selection) => selection.productId && selection.size);

  const updateSelection = (index, changes) => {
    setSelections((previous) => previous.map((selection, row) => (
      row === index ? { ...selection, ...changes } : selection
    )));
  };

  const handleAddToCart = () => {
    setAdding(true);
    try {
      selections.forEach((selection) => {
        const product = products.find((entry) => entry._id === selection.productId);
        addItem(product, selection.size, 1);
      });
      showToast(`Your ${boxSize}-juice box was added to the cart`, "success");
    } catch {
      showToast("Couldn't add your juice box. Please try again.", "error");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="section"><h1>Build a Juice Box</h1><ProductGridSkeleton count={4} /></div>;
  if (error) return <div className="section empty-state"><h1>Build a Juice Box</h1><p role="alert">{error}</p><button className="btn-primary" onClick={() => window.location.reload()}>Try again</button></div>;
  if (!products.length) return <div className="section empty-state"><h1>Build a Juice Box</h1><p>No juices are currently available to add to a box.</p><Link className="btn-primary" to="/shop">Browse the shop</Link></div>;

  return (
    <div className="section build-box-page">
      <div className="feature-heading">
        <span className="eyebrow">YOUR FRESH MIX</span>
        <h1>Build a Juice Box</h1>
        <p>Choose {boxSize} different juices. Pick a size for each bottle and see the full menu-price breakdown.</p>
      </div>
      <div className="box-builder">
        <div className="box-selections">
          {selections.map((selection, index) => {
            const product = products.find((entry) => entry._id === selection.productId);
            const selectedIds = selections.map((entry, row) => row === index ? "" : entry.productId).filter(Boolean);
            return (
              <article className="box-selection" key={index}>
                <span className="box-selection-number">Juice {index + 1}</span>
                <label htmlFor={`box-product-${index}`}>Choose a juice</label>
                <select
                  id={`box-product-${index}`}
                  value={selection.productId}
                  onChange={(event) => {
                    const nextProduct = products.find((entry) => entry._id === event.target.value);
                    updateSelection(index, {
                      productId: event.target.value,
                      size: nextProduct?.sizePrices?.[0]?.size || nextProduct?.sizes?.[0] || "",
                    });
                  }}
                >
                  <option value="">Select a juice</option>
                  {products.map((option) => (
                    <option key={option._id} value={option._id} disabled={selectedIds.includes(option._id)}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {product && (
                  <div className="box-product-choice">
                    <ProductImage product={product} />
                    <div>
                      <label htmlFor={`box-size-${index}`}>Bottle size</label>
                      <select id={`box-size-${index}`} value={selection.size} onChange={(event) => updateSelection(index, { size: event.target.value })}>
                        {(product.sizePrices || product.sizes.map((size) => ({ size, price: product.price }))).map((variant) => (
                          <option key={variant.size} value={variant.size}>{variant.size} — ₹{variant.price}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <aside className="box-price-summary">
          <h2>Your box</h2>
          <p>{selectedProducts.length} of {boxSize} juices selected</p>
          <div className="box-price-lines">
            {selections.map((selection, index) => {
              const product = products.find((entry) => entry._id === selection.productId);
              return product ? (
                <div className="summary-row" key={`${product._id}-${selection.size}`}>
                  <span>{product.name} · {selection.size}</span><span>₹{firstPrice(product, selection.size)}</span>
                </div>
              ) : (
                <div className="summary-row" key={`empty-${index}`}><span>Juice {index + 1}</span><span>—</span></div>
              );
            })}
          </div>
          <div className="summary-row total"><span>Box subtotal</span><span>₹{subtotal}</span></div>
          <p className="box-price-note">Each bottle is charged at its listed size price. No bundle discount is applied.</p>
          <button className="btn-primary full-width" disabled={!complete || adding} onClick={handleAddToCart}>
            {adding ? "Adding…" : "Add box to cart"}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default BuildJuiceBox;
