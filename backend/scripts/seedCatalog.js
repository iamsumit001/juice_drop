require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const products = require("../seed/seedData");

const seedCatalog = async () => {
  try {
    await connectDB();
    const result = await Product.bulkWrite(products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $setOnInsert: product },
        upsert: true,
      },
    })));
    console.log(`Catalog initialized safely: ${result.upsertedCount} products added; existing products were preserved.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Catalog initialization failed:", error);
    await mongoose.disconnect();
    process.exitCode = 1;
  }
};

seedCatalog();
