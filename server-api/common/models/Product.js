const DataTypes = require('sequelize');
const productPriceUnits = require("../../config")
const CategoryModel = require('./Category');

const sequelize = require('./SequelizeInstance');

const ProductModel = sequelize.define("Product", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priceUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: productPriceUnits.DOLLAR,
    },
    blockchainStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
  });

module.exports = {
  createProduct: (product) => {
    return ProductModel.create(product);
  },
  findProduct: (query) => {
      return ProductModel.findOne({ where: query });
  },
  updateProduct: (query, updatedValues) => {
      return ProductModel.update(updatedValues, { where: query });
  },
  findAllProducts: (where = {}, options = {}) => {
      return ProductModel.findAll({ where, ...options});
  },
  deleteProduct: (query) => {
      return ProductModel.destroy({ where: query });
  },
  Product: ProductModel
};