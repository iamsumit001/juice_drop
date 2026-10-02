const Store = require("../models/Store");
const { validateStore } = require("../utils/validators");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/stores?ownership=&city=&search=
const getStores = async (req, res, next) => {
  try {
    const query = { active: true };
    const { ownership, city, search } = req.query;

    if (ownership && ["company-owned", "franchise"].includes(ownership)) {
      query.ownership = ownership;
    }
    if (city) query.city = { $regex: escapeRegex(city.trim()), $options: "i" };
    if (search) {
      const term = { $regex: escapeRegex(search.trim()), $options: "i" };
      query.$or = [{ name: term }, { address: term }, { city: term }, { state: term }];
    }

    const stores = await Store.find(query).sort({ city: 1, name: 1 });
    res.json({ success: true, count: stores.length, stores });
  } catch (err) {
    next(err);
  }
};

// GET /api/stores/admin (admin)
const getAllStores = async (req, res, next) => {
  try {
    const stores = await Store.find().sort({ city: 1, name: 1 });
    res.json({ success: true, count: stores.length, stores });
  } catch (err) {
    next(err);
  }
};

// POST /api/stores (admin)
const createStore = async (req, res, next) => {
  try {
    const errors = validateStore(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    const store = await Store.create(req.body);
    res.status(201).json({ success: true, store });
  } catch (err) {
    next(err);
  }
};

// PUT /api/stores/:id (admin)
const updateStore = async (req, res, next) => {
  try {
    const existing = await Store.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const errors = validateStore({ ...existing.toObject(), ...req.body });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, store });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/stores/:id (admin)
const deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    res.json({ success: true, message: "Store deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStores, getAllStores, createStore, updateStore, deleteStore };
