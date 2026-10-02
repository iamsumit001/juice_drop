const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const rateLimiter = require("../middleware/rateLimiter");

const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", protect, getMe);

module.exports = router;
