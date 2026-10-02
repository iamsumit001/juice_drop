require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const products = [
  { name: "Mango Bliss", description: "Sweet Alphonso mango juice, pure and pulpy.", price: 149, category: "Fresh Juices", image: "/images/products/mango-bliss.svg", ingredients: ["Mango", "Water", "Honey"], calories: 120, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 149 }, { size: "500ml", price: 224 }], stock: 40, rating: 4.7 },
  { name: "Green Detox", description: "Cucumber, spinach, kale and apple cold-pressed cleanse.", price: 179, category: "Detox", image: "/images/products/green-detox.svg", ingredients: ["Cucumber", "Spinach", "Kale", "Apple"], calories: 80, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 179 }, { size: "500ml", price: 269 }], stock: 35, rating: 4.5 },
  { name: "Berry Blast", description: "Strawberry, blueberry and raspberry cold-pressed mix.", price: 199, category: "Cold Pressed", image: "/images/products/berry-blast.svg", ingredients: ["Strawberry", "Blueberry", "Raspberry"], calories: 130, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 199 }, { size: "500ml", price: 299 }], stock: 30, rating: 4.8 },
  { name: "Orange Sunrise", description: "Freshly squeezed orange juice, no added sugar.", price: 129, category: "Fresh Juices", image: "/images/products/orange-sunrise.svg", ingredients: ["Orange"], calories: 110, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 129 }, { size: "500ml", price: 194 }], stock: 50, rating: 4.6 },
  { name: "Watermelon Mint", description: "Chilled watermelon juice with a hint of fresh mint.", price: 139, category: "Seasonal", image: "/images/products/watermelon-mint.svg", ingredients: ["Watermelon", "Mint"], calories: 90, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 139 }, { size: "500ml", price: 209 }], stock: 45, rating: 4.4 },
  { name: "Pineapple Punch", description: "Tangy pineapple cold-pressed juice.", price: 159, category: "Cold Pressed", image: "/images/products/pineapple-punch.svg", ingredients: ["Pineapple", "Lime"], calories: 100, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 159 }, { size: "500ml", price: 239 }], stock: 38, rating: 4.5 },
  { name: "ABC Immunity", description: "Apple, beetroot and carrot immunity booster.", price: 189, category: "Detox", image: "/images/products/abc-immunity.svg", ingredients: ["Apple", "Beetroot", "Carrot"], calories: 95, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 189 }, { size: "500ml", price: 284 }], stock: 32, rating: 4.6 },
  { name: "Avocado Smoothie", description: "Creamy avocado smoothie with almond milk.", price: 219, category: "Smoothies", image: "/images/products/avocado-smoothie.svg", ingredients: ["Avocado", "Almond Milk", "Honey"], calories: 220, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 219 }, { size: "500ml", price: 329 }], stock: 25, rating: 4.7 },
  { name: "Strawberry Banana", description: "Classic strawberry banana smoothie, thick and creamy.", price: 179, category: "Smoothies", image: "/images/products/strawberry-banana.svg", ingredients: ["Strawberry", "Banana", "Yogurt"], calories: 200, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 179 }, { size: "500ml", price: 269 }], stock: 40, rating: 4.8 },
  { name: "Coconut Cooler", description: "Refreshing tender coconut water, naturally sweet.", price: 99, category: "Seasonal", image: "/images/products/coconut-cooler.svg", ingredients: ["Coconut Water"], calories: 60, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 99 }, { size: "500ml", price: 149 }], stock: 55, rating: 4.5 },
  { name: "Protein Power", description: "Peanut butter, banana and whey protein blend.", price: 249, category: "Protein", image: "/images/products/protein-power.svg", ingredients: ["Banana", "Peanut Butter", "Whey Protein"], calories: 320, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 249 }, { size: "500ml", price: 374 }], stock: 28, rating: 4.9 },
  { name: "Tropical Paradise", description: "Mango, pineapple and passionfruit tropical mix.", price: 189, category: "Fresh Juices", image: "/images/products/tropical-paradise.svg", ingredients: ["Mango", "Pineapple", "Passionfruit"], calories: 140, sizes: ["250ml", "500ml"], sizePrices: [{ size: "250ml", price: 189 }, { size: "500ml", price: 284 }], stock: 33, rating: 4.6 },
];

const seed = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    await Product.insertMany(products);

    await User.create({
      name: "Admin User",
      email: "admin@juicedrop.com",
      password: "admin123",
      phone: "9999999999",
      role: "admin",
      address: { house: "1", street: "HQ Street", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
    });

    await User.create({
      name: "Demo Customer",
      email: "customer@juicedrop.com",
      password: "customer123",
      phone: "8888888888",
      role: "customer",
      address: { house: "12", street: "MG Road", city: "Jaipur", state: "Rajasthan", pincode: "302004" },
    });

    console.log("Seed complete:");
    console.log(`  ${products.length} products inserted`);
    console.log("  Admin login:    admin@juicedrop.com / admin123");
    console.log("  Customer login: customer@juicedrop.com / customer123");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

if (require.main === module) seed();

module.exports = products;
