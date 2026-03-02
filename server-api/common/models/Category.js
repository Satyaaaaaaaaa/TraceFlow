const DataTypes = require('sequelize');
const sequelize = require('./SequelizeInstance');

const CategoryModel = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  icon: {  // ← Make sure this field exists!
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'FaBox'
  }
});

module.exports = {
    createCategory: (category) => CategoryModel.create(category),
    findCategory: (query) => CategoryModel.findOne({ where: query }),
    updateCategory: (query, updatedValues) => CategoryModel.update(updatedValues, { where: query }),
    findAllCategories: (query) => CategoryModel.findAll({ where: query }),
    deleteCategory: (query) => CategoryModel.destroy({ where: query }),
    Category: CategoryModel
}