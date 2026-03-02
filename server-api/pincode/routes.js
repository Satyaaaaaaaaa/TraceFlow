const express = require("express");
const router = express.Router();

const PincodeController = require("./controllers/PincodeController");

router.get("/:pincode", PincodeController.getLocationFromPincode);

module.exports = router;