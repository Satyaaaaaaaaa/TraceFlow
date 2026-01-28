// models/UserBlockchainStatus.js
const { DataTypes } = require("sequelize");
const sequelize = require("./SequelizeInstance");

const UserBlockchainStatusModel = sequelize.define(
  "UserBlockchainStatus",
  {
    userId: {
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
  //create default row
  createUserBCStatus: (userId) => {
    return UserBlockchainStatusModel.create({ userId });
  },

  //read
  findUserBCStatus: (query) => {
    return UserBlockchainStatusModel.findOne({ where: query });
  },

  // update
  updateUserBCStatus: (query, updatedValues) => {
    return UserBlockchainStatusModel.update(updatedValues, {
      where: query,
    });
  },

  UserBlockchainStatus: UserBlockchainStatusModel,
};
