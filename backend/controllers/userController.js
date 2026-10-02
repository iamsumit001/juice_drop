const User = require("../models/User");
const Order = require("../models/Order");

// GET /api/users (admin) — list customers with order/spend summary
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const orderAgg = await Order.aggregate([
      { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$total" } } },
    ]);
    const aggMap = {};
    orderAgg.forEach((a) => { aggMap[a._id.toString()] = a; });

    const result = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      orders: aggMap[u._id.toString()]?.orders || 0,
      spent: aggMap[u._id.toString()]?.spent || 0,
    }));

    res.json({ success: true, count: result.length, users: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id (admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    res.json({ success: true, user, orders });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUserById };
