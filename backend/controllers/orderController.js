const Order = require("../models/Order");
const Product = require("../models/Product");
const { validateOrder } = require("../utils/validators");
const { getUnitPrice } = require("../utils/pricing");

const DELIVERY_THRESHOLD = 299;
const DELIVERY_FEE = 49;
const TAX_RATE = 0.05;

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    const errors = validateOrder(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const selectedSize = item.size || product.sizes[0];
      if (!product.sizes.includes(selectedSize)) {
        return res.status(400).json({ success: false, message: `Invalid size for ${product.name}` });
      }
      const unitPrice = getUnitPrice(product, item.quantity, selectedSize);
      subtotal += unitPrice * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: unitPrice,
        size: selectedSize,
        quantity: item.quantity,
      });
      product.stock -= item.quantity;
      await product.save();
    }

    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === "JUICE10") {
      discount = subtotal * 0.1;
    }

    const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const tax = Math.round((subtotal - discount) * TAX_RATE);
    const total = Math.round(subtotal - discount + deliveryFee + tax);

    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      estimatedDelivery,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders (admin)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ["Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
