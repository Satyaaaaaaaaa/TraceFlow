async function addOrUpdateReview(
  { userId, productId, rating, reviewText },
  models
) {
  const { Review, Product, OrderItem, Order } = models;

  // ✅ 1. Validate purchase
  const hasBought = await Order.findOne({
    where: {
      userID: userId,
      status: "Delivered"
    },
    include: [
      {
        model: OrderItem,
        required: true,
        where: { productID: productId }
      }
    ]
  });

  if (!hasBought) {
    throw new Error("You can only review purchased products");
  }

  // ✅ 2. Get product
  const product = await Product.findByPk(productId);
  if (!product) throw new Error("Product not found");

  const existing = await Review.findOne({
    where: { userId, productId }
  });

  // =========================
  // 🔥 UPDATE REVIEW
  // =========================
  if (existing) {
    const oldRating = existing.rating;

    await existing.update({
      rating,
      reviewText: reviewText ?? existing.reviewText
    });

    const total = product.totalReviews || 0;

    if (total === 0) {
      throw new Error("Invalid state: totalReviews is 0 during update");
    }

    let newAvg =
      (product.averageRating * total - oldRating + rating) / total;

    // ✅ Safety
    if (!isFinite(newAvg)) {
      throw new Error("Invalid average calculation");
    }

    newAvg = Number(newAvg.toFixed(2));

    await product.update({
      averageRating: newAvg
    });

  } 
  // =========================
  // 🔥 CREATE REVIEW
  // =========================
  else {
    await Review.create({
      userId,
      productId,
      rating,
      reviewText
    });

    const total = product.totalReviews || 0;
    const newTotal = total + 1;

    let newAvg =
      total === 0
        ? rating
        : (product.averageRating * total + rating) / newTotal;

    // ✅ Safety
    if (!isFinite(newAvg)) {
      throw new Error("Invalid average calculation");
    }

    newAvg = Number(newAvg.toFixed(2));

    await product.update({
      averageRating: newAvg,
      totalReviews: newTotal
    });
  }

  return { success: true };
}

async function getReviews(productId, query, models) {
  const { Review } = models;
  const { page = 1, limit = 10 } = query;

  return Review.findAndCountAll({
    where: { productId },
    limit: +limit,
    offset: (page - 1) * limit,
    order: [["createdAt", "DESC"]]
  });
}

module.exports = {
  addOrUpdateReview,
  getReviews
};