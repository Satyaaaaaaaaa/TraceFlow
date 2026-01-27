const { DataTypes } = require("sequelize");
const { roles } = require("../../config");
const sequelize = require("./SequelizeInstance");

// Define the User model
const UserModel = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        //defaultValue: roles.USER //REMOVED DEFAULT VALUE
    },

    //ADDED FIELD
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    gstin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    blockchainStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

// Export the model and CRUD methods
module.exports = {
    createUser: (user) => {
        return UserModel.create(user);
    }, 
    findUser: (query) => {
        return UserModel.findOne({
            where: query,
        });
    },
    updateUser: (query, updatedValues) => {
        return UserModel.update(updatedValues, {
            where: query
        });
    },
    findAllUsers: (query) => {
        return UserModel.findAll({
            where: query
        });
    },
    deleteUser: (query) => {
        return UserModel.destroy({
            where: query
        });
    },
    User: UserModel
};
