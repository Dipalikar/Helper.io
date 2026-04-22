import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes   
  max: 100,                   
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Try again after 1 minute."
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Wait 1 minute before retrying."
    });
  },
});
