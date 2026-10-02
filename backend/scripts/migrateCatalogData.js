require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const imageByName = {
  "Mango Bliss": "/images/products/mango-bliss.svg",
  "Green Detox": "/images/products/green-detox.svg",
  "Berry Blast": "/images/products/berry-blast.svg",
  "Orange Sunrise": "/images/products/orange-sunrise.svg",
  "Watermelon Mint": "/images/products/watermelon-mint.svg",
  "Pineapple Punch": "/images/products/pineapple-punch.svg",
  "ABC Immunity": "/images/products/abc-immunity.svg",
  "Avocado Smoothie": "/images/products/avocado-smoothie.svg",
  "Strawberry Banana": "/images/products/strawberry-banana.svg",
  "Coconut Cooler": "/images/products/coconut-cooler.svg",
  "Protein Power": "/images/products/protein-power.svg",
  "Tropical Paradise": "/images/products/tropical-paradise.svg",
};

const migrate = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let updated = 0;
  for (const product of await Product.find()) {
    const update = {};
    if (!product.sizePrices?.length) {
      const sizes = product.sizes.length ? product.sizes : ["250ml", "500ml"];
      update.sizes = sizes;
      update.sizePrices = sizes.map((size, index) => {
        const factor = index === 0 ? 1 : 1.5 ** index;
        return {
          size,
          price: Math.round(product.price * factor),
          priceTiers: (product.priceTiers || []).map((tier) => ({
            minQuantity: tier.minQuantity,
            unitPrice: Math.round(tier.unitPrice * factor),
          })),
        };
      });
    }
    if (imageByName[product.name]) update.image = imageByName[product.name];
    if (Object.keys(update).length) {
      await Product.updateOne({ _id: product._id }, { $set: update });
      updated += 1;
    }
  }
  console.log(`Catalog migration complete: ${updated} products updated.`);
  await mongoose.disconnect();
};

migrate().catch(async (err) => {
  console.error("Catalog migration failed:", err);
  await mongoose.disconnect();
  process.exitCode = 1;
});
