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
        isNumeric(value) {
          if (!/^\d{10}$/.test(value.trim())) {
            throw new Error('Phone number must be exactly 10 digits');
          }
        }
      },
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true, 
            len: [6, 6], 
        },
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false,
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
    isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    addressType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'house',
    },
    weekendDelivery: {
        // Stored as JSON: { saturday: true/false/null, sunday: true/false/null }
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: { saturday: null, sunday: null },
    },
    deliveryInstructions: {
        // Pipe-separated string: "Call before delivery | Fragile item"
        type: DataTypes.TEXT('long'),
        allowNull: true,
        defaultValue: null,
    },
}, 

{
    timestamps: true, // Adds createdAt and updatedAt fields
});

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
