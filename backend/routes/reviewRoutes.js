const express = require("express");
const router = express.Router();
const { getReviews, getMyReview, createReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:id/reviews", getReviews);
router.get("/:id/reviews/mine", protect, getMyReview);
router.post("/:id/reviews", protect, createReview);

module.exports = router;
