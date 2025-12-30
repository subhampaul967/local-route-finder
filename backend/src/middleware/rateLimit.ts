import rateLimit from "express-rate-limit";

// General rate limiter applied to all routes to protect the API from abuse.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints such as OTP login.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Default export for use in app.ts
export const rateLimitMiddleware = generalLimiter;
