const DataTypes = require("sequelize");
const sequelize = require("./SequelizeInstance");

const ImageModel = sequelize.define("Image", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  extension: {
    type: DataTypes.STRING,
    allowNull: false,
  }
//   productId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
});

module.exports = {
  createImage: (image) => {
    return ImageModel.create(image);
  },

  findImage: (where = {}, options = {}) => {
    return ImageModel.findOne({ where, ...options });
  },

  findAllImages: (where = {}, options = {}) => {
    return ImageModel.findAll({ where, ...options });
  },

  updateImage: (query, updatedValues) => {
    return ImageModel.update(updatedValues, { where: query });
  },

  deleteImage: (query) => {
    return ImageModel.destroy({ where: query });
  },

  Image: ImageModel,
};
