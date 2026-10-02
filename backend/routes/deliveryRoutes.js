const express = require("express");
const router = express.Router();

const getDeliveryConfig = () => {
  const pinCodes = (process.env.DELIVERY_PINCODES || "")
    .split(",")
    .map((pin) => pin.trim())
    .filter(Boolean);
  const slots = (process.env.DELIVERY_SLOTS || "")
    .split(",")
    .map((slot) => slot.trim())
    .filter(Boolean);
  const etaMinutes = Number(process.env.DELIVERY_ETA_MINUTES || 45);
  const juiceBoxSize = Number(process.env.JUICE_BOX_SIZE || 4);
  if (!Number.isInteger(etaMinutes) || etaMinutes < 1) throw new Error("DELIVERY_ETA_MINUTES must be a positive whole number");
  if (!Number.isInteger(juiceBoxSize) || juiceBoxSize < 2) throw new Error("JUICE_BOX_SIZE must be a whole number of at least 2");
  return { pinCodes, slots, etaMinutes, juiceBoxSize };
};

router.get("/config", (req, res, next) => {
  try {
    const { juiceBoxSize } = getDeliveryConfig();
    res.json({ success: true, juiceBoxSize });
  } catch (err) {
    next(err);
  }
});

router.get("/:pincode", (req, res, next) => {
  try {
    const { pinCodes, slots, etaMinutes } = getDeliveryConfig();
    const { pincode } = req.params;
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: "Enter a valid six-digit Indian PIN code" });
    }
    const available = pinCodes.includes(pincode);
    res.json({
      success: true,
      available,
      pincode,
      etaMinutes: available ? etaMinutes : null,
      slots: available ? slots : [],
      message: available ? "Great news — we deliver to this PIN code." : "Sorry, delivery is not available in this PIN code yet.",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
