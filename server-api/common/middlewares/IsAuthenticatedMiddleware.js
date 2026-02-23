const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

module.exports = {
  check: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        error: { message: "Unauthorized access" }
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, jwtSecret);

      //JWT has been signed with [username, userId]
      req.user = {
        id: decoded.userId,
        username: decoded.username,
      };

      next();
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid token.";

      return res.status(403).json({
        status: false,
        error: { message }
      });
    }
  }
};