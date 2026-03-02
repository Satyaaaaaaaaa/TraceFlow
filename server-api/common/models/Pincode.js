const { DataTypes } = require("sequelize");
const sequelize = require('./SequelizeInstance');

const Pincode = sequelize.define("Pincode", {
    pincode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING
});

module.exports = { Pincode };