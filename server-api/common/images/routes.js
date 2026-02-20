const express = require("express");
const router = express.Router();

//controllers
const uploadProductImages = require("./controllers/UploadImageProductController");
const uploadProfileImage = require("./controllers/UploadImageProfileController");

//auth
const  authenticationMidddleware  = require("./middleware/authenticationMidddleware");

router.post(
  "/profile",
  authenticationMidddleware,
  uploadProfileImage
);

router.post(
  "/product",
  uploadProductImages
);

module.exports = router;
