const DataTypes = require("sequelize");
const sequelize = require("./SequelizeInstance");

const ReviewModel = sequelize.define("Review", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },

  reviewText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  timestamps: true,

  indexes: [
    {
      unique: true,
      fields: ["userId", "productId"], //critical constraint
    },
    {
      fields: ["productId"], // for fast queries
    }
  ]
});

module.exports = {

  // CREATE OR UPDATE (important: don’t blindly create)
  upsertReview: async (review, options = {}) => {
    return ReviewModel.upsert(review, options);
  },

  // FIND ONE
  findReview: (where = {}, options = {}) => {
    return ReviewModel.findOne({ where, ...options });
  },

  // FIND ALL (with pagination support)
  findAllReviews: (where = {}, options = {}) => {
    return ReviewModel.findAll({ where, ...options });
  },

  // COUNT (useful for analytics)
  countReviews: (where = {}) => {
    return ReviewModel.count({ where });
  },

  // UPDATE
  updateReview: (query, updatedValues, options = {}) => {
    return ReviewModel.update(updatedValues, { where: query, ...options });
  },

  // DELETE (soft delete recommended in production)
  deleteReview: (query, options = {}) => {
    return ReviewModel.destroy({ where: query, ...options });
  },

  Review: ReviewModel,
};