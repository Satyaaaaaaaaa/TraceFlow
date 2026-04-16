const ReviewService = require("../services/ReviewService");
const models = require("../../common/models/associations");

async function addOrUpdateReview(req, res) {
  try {
    const result = await ReviewService.addOrUpdateReview(
      {
        userId: req.user.id,
        ...req.body
      },
      models
    );

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getReviews(req, res) {
  try {
    const { productId } = req.params;

    const reviews = await ReviewService.getReviews(
      productId,
      req.query,
      models
    );

    return res.json(reviews);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function canReview(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const hasBought = await ReviewService.hasUserPurchasedProduct(
      userId,
      productId,
      models
    );

    return res.json({
      canReview: hasBought
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

module.exports = {
  addOrUpdateReview,
  getReviews,
  canReview
};