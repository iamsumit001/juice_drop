const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownership: {
      type: String,
      required: true,
      enum: ["company-owned", "franchise"],
    },
    description: { type: String, default: "", trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    hours: { type: String, default: "", trim: true },
    mapUrl: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

storeSchema.index({ name: 1, city: 1 });

module.exports = mongoose.model("Store", storeSchema);
