import rateLimit from 'express-rate-limit'

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many request. Please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                          // fixed from 100 → 15
  message: { error: "Too many login attempts" },
  standardHeaders: true,
  legacyHeaders: false,
})

