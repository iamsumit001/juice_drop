import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeleton";

const CATEGORIES = ["All", "Fresh Juices", "Cold Pressed", "Smoothies", "Detox", "Protein", "Seasonal"];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (search) params.search = search;
    if (category !== "All") params.category = category;
    if (sort) params.sort = sort;

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data.products))
      .catch(() => setError("Couldn't load the juice catalog. Please try again."))
      .finally(() => setLoading(false));
  }, [search, category, sort, retryKey]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="section">
      <h1>Shop Fresh Juices</h1>

      <div className="shop-filters">
        <div className="search-box">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="shop-search">Search juices</label>
          <input
            id="shop-search"
            placeholder="Search juices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <label className="sr-only" htmlFor="shop-category">Filter by category</label>
        <select id="shop-category" aria-label="Filter by category" value={category} onChange={(e) => updateParam("category", e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="sr-only" htmlFor="shop-sort">Sort juices</label>
        <select id="shop-sort" aria-label="Sort juices" value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Rating</option>
          <option value="name">Name</option>
        </select>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <div className="empty-state fade-in" role="alert">
          <h3>Catalog temporarily unavailable</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => setRetryKey((previous) => previous + 1)}>Retry</button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state fade-in">
          <h3>No juices match your search</h3>
          <p>Try a different category, search term, or clear your filters.</p>
        </div>
      ) : (
        <div className="product-grid fade-in">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Shop;
