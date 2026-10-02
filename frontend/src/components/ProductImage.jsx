import { useState } from "react";

const PRODUCT_IMAGES = {
  "Mango Bliss": "mango-bliss",
  "Green Detox": "green-detox",
  "Berry Blast": "berry-blast",
  "Orange Sunrise": "orange-sunrise",
  "Watermelon Mint": "watermelon-mint",
  "Pineapple Punch": "pineapple-punch",
  "ABC Immunity": "abc-immunity",
  "Avocado Smoothie": "avocado-smoothie",
  "Strawberry Banana": "strawberry-banana",
  "Coconut Cooler": "coconut-cooler",
  "Protein Power": "protein-power",
  "Tropical Paradise": "tropical-paradise",
};

const ProductImage = ({ product, className = "", loading = "lazy" }) => {
  const [failed, setFailed] = useState(false);
  const filename = PRODUCT_IMAGES[product.name];
  const fallback = `/images/products/${filename || "juice-fallback"}.svg`;
  const source = failed || !product.image ? fallback : product.image;
  const ingredients = product.ingredients?.length ? product.ingredients.join(", ") : "fresh ingredients";

  return (
    <img
      src={source}
      alt={`${product.name} juice with ${ingredients}`}
      className={className}
      loading={loading}
      onError={(event) => {
        if (!failed && source !== fallback) setFailed(true);
        else event.currentTarget.style.visibility = "hidden";
      }}
    />
  );
};

export default ProductImage;
