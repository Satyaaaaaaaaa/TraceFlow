const jwt = require('jsonwebtoken');
const { jwtExpirationInSeconds } = require('../../config');

const jwtSecret = process.env.JWT_SECRET

module.exports = {
  generateAccessToken: (username, userId) => {
    return jwt.sign(
      { username, userId },
      jwtSecret,
      { expiresIn: jwtExpirationInSeconds }
    );
  }
};