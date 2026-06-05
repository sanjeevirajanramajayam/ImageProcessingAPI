import rateLimit from "express-rate-limit";

export const transformLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many transformation requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Don't count requests that don't use transform to avoid blocking legit traffic
    return !req.path.includes("/transform");
  },
});
