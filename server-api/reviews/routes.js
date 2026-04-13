const express = require("express");
const router = express.Router();
const ReviewController = require("./controllers/ReviewController");
const isAuthenticatedMiddleware = require("../common/middlewares/IsAuthenticatedMiddleware")

router.post(
    "/", 
    isAuthenticatedMiddleware.check,
    ReviewController.addOrUpdateReview);

router.get("/:productId", ReviewController.getReviews);

module.exports = router;