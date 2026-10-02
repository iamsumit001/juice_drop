const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateRegister = (body) => {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push("Name must be at least 2 characters");
  if (!body.email || !isValidEmail(body.email)) errors.push("A valid email is required");
  if (!body.password || body.password.length < 6) errors.push("Password must be at least 6 characters");
  if (body.phone && !/^[0-9+\-\s]{7,15}$/.test(body.phone)) errors.push("Phone number looks invalid");
  return errors;
};

const validateLogin = (body) => {
  const errors = [];
  if (!body.email || !isValidEmail(body.email)) errors.push("A valid email is required");
  if (!body.password) errors.push("Password is required");
  return errors;
};

const validateProduct = (body) => {
  const errors = [];
  const validCategories = ["Fresh Juices", "Cold Pressed", "Smoothies", "Detox", "Protein", "Seasonal"];
  if (!body.name || body.name.trim().length < 2) errors.push("Product name is required");
  if (!body.description || body.description.trim().length < 5) errors.push("Description must be at least 5 characters");
  if (body.price === undefined || isNaN(Number(body.price)) || Number(body.price) < 0) errors.push("Price must be a non-negative number");
  if (!body.category || !validCategories.includes(body.category)) errors.push(`Category must be one of: ${validCategories.join(", ")}`);
  if (body.stock !== undefined && (isNaN(Number(body.stock)) || Number(body.stock) < 0)) errors.push("Stock must be a non-negative number");
  if (body.sizePrices === undefined) {
    errors.push("Configure a separate unit price for each product size");
  } else {
    if (!Array.isArray(body.sizePrices) || body.sizePrices.length === 0) {
      errors.push("Configure a price for each product size");
    } else {
      const seenSizes = new Set();
      if (Array.isArray(body.sizes) && new Set(body.sizes).size !== body.sizes.length) {
        errors.push("Product sizes must be unique");
      }
      body.sizePrices.forEach((variant, variantIndex) => {
        const label = variant && typeof variant.size === "string" ? variant.size : `Size ${variantIndex + 1}`;
        if (!variant || typeof variant !== "object" || !label.trim()) {
          errors.push(`Size ${variantIndex + 1}: size is required`);
          return;
        }
        if (seenSizes.has(label.trim())) errors.push(`${label}: size must be unique`);
        seenSizes.add(label.trim());
        const basePrice = Number(variant.price);
        if (!Number.isFinite(basePrice) || basePrice < 0) {
          errors.push(`${label}: price must be a non-negative number`);
        }
        const tiers = Array.isArray(variant.priceTiers) ? variant.priceTiers : [];
        const sortedTiers = tiers
          .map((tier) => ({
            minQuantity: Number(tier && typeof tier === "object" ? tier.minQuantity : NaN),
            unitPrice: Number(tier && typeof tier === "object" ? tier.unitPrice : NaN),
          }))
          .sort((a, b) => a.minQuantity - b.minQuantity);
        const seenQuantities = new Set();
        let previousPrice = basePrice;
        sortedTiers.forEach((tier, tierIndex) => {
          if (!Number.isInteger(tier.minQuantity) || tier.minQuantity < 2) {
            errors.push(`${label}, price tier ${tierIndex + 1}: minimum quantity must be a whole number of at least 2`);
          } else if (seenQuantities.has(tier.minQuantity)) {
            errors.push(`${label}, price tier ${tierIndex + 1}: minimum quantity must be unique`);
          } else {
            seenQuantities.add(tier.minQuantity);
          }
          if (!Number.isFinite(tier.unitPrice) || tier.unitPrice < 0) {
            errors.push(`${label}, price tier ${tierIndex + 1}: unit price must be a non-negative number`);
          } else if (tier.unitPrice >= previousPrice) {
            errors.push(`${label}, price tier ${tierIndex + 1}: unit price must be lower than the previous tier`);
          }
          if (Number.isFinite(tier.unitPrice) && tier.unitPrice >= 0) previousPrice = tier.unitPrice;
        });
      });
      if (Array.isArray(body.sizes) && (
        body.sizes.some((size) => !seenSizes.has(size)) || seenSizes.size !== body.sizes.length
      )) {
        errors.push("Set a separate unit price for every product size");
      }
    }
  }
  return errors;
};

const validateStore = (body) => {
  const errors = [];
  const requiredFields = [
    ["name", "Store name"],
    ["address", "Street address"],
    ["city", "City"],
    ["state", "State"],
    ["pincode", "Postal code"],
    ["phone", "Phone number"],
  ];

  requiredFields.forEach(([field, label]) => {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      errors.push(`${label} is required`);
    }
  });
  if (!["company-owned", "franchise"].includes(body.ownership)) {
    errors.push("Ownership must be company-owned or franchise");
  }
  if (body.phone && !/^[0-9+\-\s()]{7,20}$/.test(body.phone)) {
    errors.push("Phone number looks invalid");
  }
  if (body.email && !isValidEmail(body.email)) {
    errors.push("A valid store email is required");
  }
  if (body.mapUrl) {
    try {
      const url = new URL(body.mapUrl);
      if (!["http:", "https:"].includes(url.protocol)) errors.push("Map link must use HTTP or HTTPS");
    } catch {
      errors.push("Map link must be a valid URL");
    }
  }
  if (body.active !== undefined && typeof body.active !== "boolean") {
    errors.push("Store status must be active or inactive");
  }
  return errors;
};

const validateOrder = (body) => {
  const errors = [];
  if (!Array.isArray(body.items) || body.items.length === 0) errors.push("Order must contain at least one item");
  else {
    body.items.forEach((item, idx) => {
      if (!item.productId) errors.push(`Item ${idx + 1}: productId is required`);
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) errors.push(`Item ${idx + 1}: quantity must be a whole number of at least 1`);
      if (item.size !== undefined && (typeof item.size !== "string" || !item.size.trim())) errors.push(`Item ${idx + 1}: size is invalid`);
    });
  }
  const addr = body.shippingAddress;
  if (!addr) errors.push("Shipping address is required");
  else {
    ["name", "phone", "email", "house", "street", "city", "state", "pincode"].forEach((field) => {
      if (!addr[field] || String(addr[field]).trim() === "") errors.push(`Shipping address: ${field} is required`);
    });
    if (addr.pincode && !/^[0-9]{4,10}$/.test(addr.pincode)) errors.push("Shipping address: pincode looks invalid");
  }
  if (body.paymentMethod && !["COD", "Online"].includes(body.paymentMethod)) errors.push("Invalid payment method");
  return errors;
};

module.exports = { isValidEmail, validateRegister, validateLogin, validateProduct, validateStore, validateOrder };
