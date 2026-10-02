const mongoose = require("mongoose");

const priceTierSchema = new mongoose.Schema(
  {
    minQuantity: { type: Number, required: true, min: 2 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const sizePriceSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    priceTiers: { type: [priceTierSchema], default: [] },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    priceTiers: { type: [priceTierSchema], default: [] },
    sizePrices: { type: [sizePriceSchema], default: [] },
    category: {
      type: String,
      required: true,
      enum: ["Fresh Juices", "Cold Pressed", "Smoothies", "Detox", "Protein", "Seasonal"],
    },
    image: { type: String, default: "" },
    ingredients: { type: [String], default: [] },
    calories: { type: Number, default: 0 },
    sizes: { type: [String], default: ["250ml", "500ml"] },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
