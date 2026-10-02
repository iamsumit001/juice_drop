import { useEffect, useState } from "react";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import api from "../services/api";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [ownership, setOwnership] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let current = true;
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      api.get("/stores", { params: { ownership, search: search.trim() } })
        .then((res) => {
          if (current) setStores(res.data.stores);
        })
        .catch(() => {
          if (current) setError("We couldn't load store locations. Please try again.");
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, 200);

    return () => {
      current = false;
      clearTimeout(timeout);
    };
  }, [ownership, search, retryKey]);

  return (
    <div className="stores-page">
      <section className="stores-hero">
        <span className="eyebrow">FRESHNESS AROUND THE CORNER</span>
        <h1>Find your JuiceDrop</h1>
        <p>Visit a company-owned store or meet your neighborhood franchise team.</p>
      </section>

      <section className="section stores-content">
        <div className="stores-toolbar">
          <label className="stores-search">
            <MapPin size={19} aria-hidden="true" />
            <span className="sr-only">Search by store, city, or address</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by store, city, or address"
            />
          </label>
          <label className="stores-filter">
            <span>Store type</span>
            <select value={ownership} onChange={(event) => setOwnership(event.target.value)}>
              <option value="">All stores</option>
              <option value="company-owned">Company-owned</option>
              <option value="franchise">Franchise</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="page-loading" role="status">Finding our stores…</div>
        ) : error ? (
          <div className="empty-state">
            <h2>Stores are temporarily unavailable</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => setRetryKey((value) => value + 1)}>Try again</button>
          </div>
        ) : stores.length === 0 ? (
          <div className="empty-state">
            <MapPin size={34} />
            <h2>No stores found</h2>
            <p>Try another search or store type. New JuiceDrop locations will appear here.</p>
          </div>
        ) : (
          <div className="stores-grid fade-in">
            {stores.map((store) => {
              const mapUrl = store.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${store.name}, ${store.address}, ${store.city}, ${store.state} ${store.pincode}`
              )}`;
              return (
                <article className="store-card" key={store._id}>
                  <div className="store-card-top">
                    <span className={`store-type store-type-${store.ownership}`}>
                      {store.ownership === "franchise" ? "Franchise" : "Company-owned"}
                    </span>
                    <h2>{store.name}</h2>
                    {store.description && <p className="store-description">{store.description}</p>}
                  </div>
                  <div className="store-details">
                    <p><MapPin size={18} /><span>{store.address}, {store.city}, {store.state} {store.pincode}</span></p>
                    <p><Phone size={17} /><a href={`tel:${store.phone}`}>{store.phone}</a></p>
                    {store.email && <p><Mail size={17} /><a href={`mailto:${store.email}`}>{store.email}</a></p>}
                    {store.hours && <p><Clock3 size={17} /><span>{store.hours}</span></p>}
                  </div>
                  <a className="store-map-link" href={mapUrl} target="_blank" rel="noreferrer">
                    Get directions <MapPin size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Stores;
