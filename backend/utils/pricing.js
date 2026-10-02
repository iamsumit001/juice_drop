const getUnitPrice = (product, quantity, size) => {
  const variant = (product.sizePrices || []).find((entry) => entry.size === size);
  if (!variant) {
    throw new Error(`Price for ${size} is not configured for ${product.name}`);
  }

  const applicableTier = (variant.priceTiers || [])
    .filter((tier) => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return applicableTier ? applicableTier.unitPrice : variant.price;
};

module.exports = { getUnitPrice };
