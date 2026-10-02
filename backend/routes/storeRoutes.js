const express = require("express");
const router = express.Router();
const {
  getStores,
  getAllStores,
  createStore,
  updateStore,
  deleteStore,
} = require("../controllers/storeController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getStores);
router.get("/admin", protect, adminOnly, getAllStores);
router.post("/", protect, adminOnly, createStore);
router.put("/:id", protect, adminOnly, updateStore);
router.delete("/:id", protect, adminOnly, deleteStore);

module.exports = router;
