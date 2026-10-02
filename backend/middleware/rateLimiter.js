// Lightweight in-memory rate limiter (no external dependency).
// Good enough for a hackathon demo; swap for `express-rate-limit` + Redis in production.

const buckets = new Map();

const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    }

    next();
  };
};

module.exports = rateLimiter;
