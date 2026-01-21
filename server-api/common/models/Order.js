const { DataTypes } = require("sequelize")
const sequelize = require("./SequelizeInstance")

const ORDER_STATUS = {
    SUCCESS: "Success",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered"
};

const OrderModel = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'users',
            key: 'id'
        },
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    addressID: { // Added field for associating orders with addresses
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'addresses', // Ensure the table name matches your database schema
            key: 'id',
        },
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ORDER_STATUS.SUCCESS // TODO:  [Success, Shipped, Delivered]
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
})

const OrderItemModel = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'orders',
            key: 'id'
        },
    },
    productID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'products',
            key: 'id'
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
})


module.exports = {
    Order: OrderModel,
    OrderItem: OrderItemModel,
    createOrder: (order) => {
        return OrderModel.create(order);
    },
    getOrder: (query) => {
        return OrderModel.findOne({ where: query });
    },
    findAllOrders: (query) => {
        return OrderModel.findAll({ where: query });
    },
    updateOrder: (query, updatedValues) => {
        return OrderModel.update(updatedValues, { where: query });
    },
    deleteOrder: (query) => {
        return OrderModel.destroy({ where: query });
    },
    createOrderItem: (orderItem) => {
        return OrderItemModel.create(orderItem);
    },
    getOrderItem: (query) => {
        return OrderItemModel.findOne({ where: query });
    },
    getAllOrderItems: (query) => {
        return OrderItemModel.findAll({ where: query });
    },
    updateOrderItem: (query, updatedValues) => {
        return OrderItemModel.update(updatedValues, { where: query });
    },
    deleteOrderItem: (query) => {
        return OrderItemModel.destroy({ where: query });
    },    
}