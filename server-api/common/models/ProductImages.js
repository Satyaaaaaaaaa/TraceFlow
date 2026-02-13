const { DataTypes } = require("sequelize");
const sequelize = require("./SequelizeInstance");

const ProductImages = sequelize.define("ProductImages", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = { ProductImages };
