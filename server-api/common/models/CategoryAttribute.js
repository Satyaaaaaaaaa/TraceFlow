const {DataTypes} = require('sequelize');
const sequelize = require('./SequelizeInstance');

const CategoryAttributeModel = sequelize.define("CategoryAttribute", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  attributeName: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  attributeType: {
    type: DataTypes.ENUM('dropdown', 'text', 'number', 'multiselect'),
    defaultValue: 'text'
  },
  predefinedValues: {
    type: DataTypes.JSON, 
    allowNull: true
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  } 
});

module.exports = {
  CategoryAttribute: CategoryAttributeModel,
  createCategoryAttribute: (attr) => CategoryAttributeModel.create(attr),
  findCategoryAttribute: (query) => CategoryAttributeModel.findOne({ where: query }),
  findAllCategoryAttributes: (query) => CategoryAttributeModel.findAll({ where: query }),
  updateCategoryAttribute: (query, values) => CategoryAttributeModel.update(values, { where: query }),
  deleteCategoryAttribute: (query) => CategoryAttributeModel.destroy({ where: query })
};