const express = require("express");
const router = express.Router();
const AdminDashboardController = require("../controllers/AdminDashboardController");
const IsAuthenticatedMiddleware = require("../../common/middlewares/IsAuthenticatedMiddleware");

router.get(
  "/stats",
  IsAuthenticatedMiddleware.check,
  AdminDashboardController.getDashboardStats
);

module.exports = router;
