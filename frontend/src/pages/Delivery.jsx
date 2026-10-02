import { useState } from "react";
import { Clock3, MapPin } from "lucide-react";
import api from "../services/api";

const Delivery = () => {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setError("");
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError("Enter a valid six-digit Indian PIN code.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/delivery/${pincode}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't check delivery right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section delivery-page">
      <div className="feature-heading">
        <span className="eyebrow">FRESHNESS TO YOUR DOOR</span>
        <h1>Check delivery availability</h1>
        <p>Enter your six-digit Indian PIN code to see if JuiceDrop delivers to your area.</p>
      </div>
      <form className="delivery-checker" onSubmit={handleSubmit}>
        <label htmlFor="delivery-pincode">Indian PIN code</label>
        <div className="delivery-input-row">
          <div className="delivery-input">
            <MapPin size={19} aria-hidden="true" />
            <input
              id="delivery-pincode"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[1-9][0-9]{5}"
              maxLength={6}
              value={pincode}
              onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="e.g. 302001"
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Checking…" : "Check availability"}
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {result && (
          <div className={`delivery-result ${result.available ? "delivery-available" : "delivery-unavailable"}`} role="status">
            <h2>{result.available ? "We deliver here!" : "Not in this area yet"}</h2>
            <p>{result.message}</p>
            {result.available && (
              <>
                <p><Clock3 size={17} /> Estimated delivery: about {result.etaMinutes} minutes</p>
                {result.slots.length > 0 && (
                  <div>
                    <h3>Available delivery slots</h3>
                    <ul>{result.slots.map((slot) => <li key={slot}>{slot}</li>)}</ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </form>
    </section>
  );
};

export default Delivery;
