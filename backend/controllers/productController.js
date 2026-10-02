const Product = require("../models/Product");
const { validateProduct } = require("../utils/validators");

const normalizeProductPricing = (body) => {
  if (!Array.isArray(body.sizePrices) || body.sizePrices.length === 0) return body;
  return {
    ...body,
    price: Number(body.sizePrices[0].price),
    sizes: body.sizePrices.map((variant) => variant.size.trim()),
  };
};

// GET /api/products?search=&category=&sort=&minPrice=&maxPrice=
const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort, minPrice, maxPrice } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "name") sortOption = { name: 1 };

    const products = await Product.find(query).sort(sortOption);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products (admin)
const createProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductPricing(req.body);
    const errors = validateProduct(payload);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    const product = await Product.create(payload);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const payload = normalizeProductPricing(req.body);
    const merged = { ...existing.toObject(), ...payload };
    const errors = validateProduct(merged);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
