const generateUUID = require("../utils/generateUUID");

function attachUUID(req, res, next) {
  req.productUUID = generateUUID();
  next();
}

module.exports = attachUUID;
