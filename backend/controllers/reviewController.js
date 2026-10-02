const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductReview = require("../models/ProductReview");

const getReviews = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const product = await Product.findById(req.params.id).select("rating");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const [reviews, summary] = await Promise.all([
      ProductReview.find({ product: req.params.id })
        .populate("user", "name")
        .sort({ createdAt: -1 }),
      ProductReview.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      success: true,
      reviews,
      rating: summary[0]?.average ?? product.rating,
      reviewCount: summary[0]?.count ?? 0,
    });
  } catch (err) {
    next(err);
  }
};

const getMyReview = async (req, res, next) => {
  try {
    const review = await ProductReview.findOne({ product: req.params.id, user: req.user._id });
    res.json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

const createReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const { rating, title, comment } = req.body;
    const errors = [];
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      errors.push("Rating must be a whole number from 1 to 5");
    }
    if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 100) {
      errors.push("Review title must be 3 to 100 characters");
    }
    if (typeof comment !== "string" || comment.trim().length < 10 || comment.trim().length > 1500) {
      errors.push("Review must be 10 to 1500 characters");
    }
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    await ProductReview.init();
    const review = await ProductReview.create({
      product: product._id,
      user: req.user._id,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
    });
    const summary = await ProductReview.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    product.rating = Math.round(summary[0].average * 10) / 10;
    await product.save();

    await review.populate("user", "name");
    res.status(201).json({
      success: true,
      review,
      rating: product.rating,
      reviewCount: summary[0].count,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this juice" });
    }
    next(err);
  }
};

module.exports = { getReviews, getMyReview, createReview };
