// models/ProductBlockchainStatus.js
const { DataTypes } = require("sequelize");
const sequelize = require("./SequelizeInstance");

const ProductBlockchainStatusModel = sequelize.define(
  "ProductBlockchainStatus",
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    blockchainStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
);

module.exports = {
  createProductBCStatus: (productId) => {
    return ProductBlockchainStatusModel.create({ productId });
  },

  findProductBCStatus: (query) => {
    return ProductBlockchainStatusModel.findOne({ where: query });
  },

  updateProductBCStatus: (query, updatedValues) => {
    return ProductBlockchainStatusModel.update(updatedValues, {
      where: query,
    });
  },

  deleteProductBCStatus: (query) => {
    return ProductBlockchainStatusModel.destroy({ where: query });
  },

  ProductBlockchainStatus: ProductBlockchainStatusModel,
};
