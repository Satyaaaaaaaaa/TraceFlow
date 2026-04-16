const express = require("express");
const router = express.Router();
const ReviewController = require("./controllers/ReviewController");
const isAuthenticatedMiddleware = require("../common/middlewares/IsAuthenticatedMiddleware")

router.post(
    "/", 
    isAuthenticatedMiddleware.check,
    ReviewController.addOrUpdateReview
);

router.get("/:productId", 
    ReviewController.getReviews
);

router.get(
    "/:productId/can-review",
    isAuthenticatedMiddleware.check,
    ReviewController.canReview
);

module.exports = router;