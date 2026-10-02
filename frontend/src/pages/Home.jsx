import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Truck, ShieldCheck, Clock, MapPin } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import ProductImage from "../components/ProductImage";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setFeatured(res.data.products.slice(0, 4)))
      .catch(() => showToast("Couldn't load featured juices right now", "error"))
      .finally(() => setLoadingFeatured(false));
  }, []);

  const categories = ["Fresh Juices", "Cold Pressed", "Smoothies", "Detox", "Protein", "Seasonal"];
  const heroJuices = [
    { name: "Mango Bliss", ingredients: ["mango"], image: "/images/products/mango-bliss.svg" },
    { name: "Protein Power", ingredients: ["banana", "peanut butter"], image: "/images/products/protein-power.svg" },
    { name: "Tropical Paradise", ingredients: ["mango", "pineapple"], image: "/images/products/tropical-paradise.svg" },
  ];

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="eyebrow">FRESH-PRESSED, JUST FOR YOU</span>
            <h1>Fresh Juice. Delivered Fresh.</h1>
            <p>Cold-pressed goodness, crafted fresh and delivered to your doorstep.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-primary">Order Now</Link>
              <Link to="/shop" className="btn-secondary">Explore Juices</Link>
            </div>
          </div>
          <div className="hero-showcase" aria-label="JuiceDrop juice selection">
            {heroJuices.map((product, index) => (
              <div className={`hero-juice hero-juice-${index + 1}`} key={product.name}>
                <ProductImage product={product} loading="eager" />
                <span>{product.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Featured Juices</h2>
        {loadingFeatured ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="product-grid fade-in">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      <section className="section home-tools">
        <article>
          <span className="eyebrow">DELIVERY, MADE CLEAR</span>
          <h2>Is JuiceDrop in your neighborhood?</h2>
          <p>Check your six-digit PIN code for delivery availability and an estimated arrival.</p>
          <Link to="/delivery" className="btn-secondary">Check delivery</Link>
        </article>
        <article>
          <span className="eyebrow">MIX YOUR FAVORITES</span>
          <h2>Your own fresh Juice Box</h2>
          <p>Choose your juices and bottle sizes. See every item price before adding them to your cart.</p>
          <Link to="/build-a-box" className="btn-primary">Build a Juice Box</Link>
        </article>
      </section>

      <section className="section categories-section">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="category-tile">
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="section stores-promo">
        <div>
          <span className="eyebrow">FIND YOUR NEAREST JUICEDROP</span>
          <h2>Freshness, closer to you.</h2>
          <p>Visit a company-owned store or one of our trusted franchise locations.</p>
          <Link to="/stores" className="btn-primary"><MapPin size={18} /> Explore our stores</Link>
        </div>
      </section>

      <section className="section why-section">
        <h2>Why JuiceDrop</h2>
        <div className="why-grid">
          <div className="why-item"><Leaf /> <h4>100% Natural</h4><p>No preservatives, no added sugar.</p></div>
          <div className="why-item"><Truck /> <h4>Fast Delivery</h4><p>Fresh juice at your door in 45 mins.</p></div>
          <div className="why-item"><ShieldCheck /> <h4>Quality Assured</h4><p>Cold-pressed for maximum nutrients.</p></div>
          <div className="why-item"><Clock /> <h4>Made Fresh Daily</h4><p>Prepared same-day, every day.</p></div>
        </div>
      </section>

      <section className="section how-section">
        <h2>How It Works</h2>
        <div className="how-grid">
          <div><span>1</span><p>Browse fresh juices</p></div>
          <div><span>2</span><p>Add to cart & checkout</p></div>
          <div><span>3</span><p>We prepare it fresh</p></div>
          <div><span>4</span><p>Delivered to your door</p></div>
        </div>
      </section>

      <section className="section testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial"><p>"Freshest juice I've had delivered — tastes homemade."</p><span>— Aarav S.</span></div>
          <div className="testimonial"><p>"The Green Detox is now part of my morning routine."</p><span>— Priya M.</span></div>
          <div className="testimonial"><p>"Fast delivery and the packaging keeps it cold."</p><span>— Rohan K.</span></div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready for your first fresh juice?</h2>
        <Link to="/shop" className="btn-primary">Order Now</Link>
      </section>
    </div>
  );
};

export default Home;
