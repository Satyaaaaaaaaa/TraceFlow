// common/models/Payment.js
const { DataTypes } = require("sequelize");
const sequelize = require("./SequelizeInstance");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
          key: "id",
        },
    },
    paymentProvider: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "e.g., Stripe, Razorpay, PayPal, etc.",
    },
    transactionID: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: "External payment provider transaction ID",
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "INR",
        comment: "ISO 4217 currency code",
    },
    status: {
        type: DataTypes.ENUM("Pending", "Success", "Failed"),
        allowNull: false,
        defaultValue: "Pending",
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Error message if payment failed",
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional payment provider data",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
  },
  {
    tableName: "Payments",
    timestamps: true,
    indexes: [
      {
        fields: ["orderID"],
      },
      {
        fields: ["transactionID"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = { Payment };