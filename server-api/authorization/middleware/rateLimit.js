const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: false,
            error: "Too many OTP requests. Try again later."
        });
    }
});

module.exports = otpLimiter;