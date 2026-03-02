const { DataTypes } = require("sequelize");
const sequelize = require("./SequelizeInstance");

// Define the Address model
const AddressModel = sequelize.define("address", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\d{10}$/, // Ensures the phone number is exactly 10 digits
        },
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true, // Ensures only numeric values
            len: [6, 6], // Ensures a 6-digit pincode
        },
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    locality: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    buildingName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    landmark: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

// Export the model and CRUD methods
module.exports = {
    createAddress: (address) => {
        return AddressModel.create(address);
    },
    findAddress: (query) => {
        return AddressModel.findOne({
            where: query,
        });
    },
    updateAddress: (query, updatedValues) => {
        return AddressModel.update(updatedValues, {
            where: query,
        });
    },
    findAllAddresses: (query) => {
        return AddressModel.findAll({
            where: query,
        });
    },
    deleteAddress: (query) => {
        return AddressModel.destroy({
            where: query,
        });
    },
    Address: AddressModel,
};
