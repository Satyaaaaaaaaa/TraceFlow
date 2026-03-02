const jwt = require('jsonwebtoken');
const { jwtExpirationInSeconds } = require('../../config');
const crypto = require('crypto');

const jwtSecret = process.env.JWT_SECRET

module.exports = {
  generateAccessToken: (username, userId) => {
    return jwt.sign(
      { username, userId },
      jwtSecret,
      { expiresIn: jwtExpirationInSeconds }
    );
  },

  encryptPassword: (password) => {
    const hash = crypto.createHash('sha256')
    hash.update(password)
    return hash.digest('hex');
}
};