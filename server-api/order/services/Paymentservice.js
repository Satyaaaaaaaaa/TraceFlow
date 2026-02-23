const { Payment } = require("../../common/models/Payment");
const { Order } = require("../../common/models/Order");
const sequelize = require("../../common/models/SequelizeInstance");

class PaymentService {

  static async processPaymentSuccess(paymentData) {
    const transaction = await sequelize.transaction();

    try {
      const { paymentID, transactionID, metadata } = paymentData;

      const payment = await Payment.findByPk(paymentID, {
        include: [{ model: Order }],
        transaction,
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Update payment
      payment.status = "Success";
      payment.transactionID = transactionID;
      payment.paidAt = new Date();
      payment.metadata = metadata || payment.metadata;
      await payment.save({ transaction });

      // Update order
      payment.Order.status = "Paid";
      await payment.Order.save({ transaction });

      await transaction.commit();

      return {
        success: true,
        payment,
        order: payment.Order,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async processPaymentFailure(paymentData) {
    const transaction = await sequelize.transaction();

    try {
      const { paymentID, failureReason, metadata } = paymentData;

      const payment = await Payment.findByPk(paymentID, {
        include: [{ model: Order }],
        transaction,
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Update payment
      payment.status = "Failed";
      payment.failureReason = failureReason;
      payment.metadata = metadata || payment.metadata;
      await payment.save({ transaction });

      // Order remains Pending for retry
      // Optionally: After X failed attempts, mark order as Failed

      await transaction.commit();

      return {
        success: true,
        payment,
        order: payment.Order,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getOrderPaymentStats(orderID) {
    try {
      const payments = await Payment.findAll({
        where: { orderID },
        order: [["createdAt", "DESC"]],
      });

      const stats = {
        totalAttempts: payments.length,
        successfulPayments: payments.filter((p) => p.status === "Success").length,
        failedPayments: payments.filter((p) => p.status === "Failed").length,
        pendingPayments: payments.filter((p) => p.status === "Pending").length,
        lastAttempt: payments[0] || null,
        paymentHistory: payments,
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  static async validatePaymentAmount(paymentID, expectedAmount) {
    try {
      const payment = await Payment.findByPk(paymentID, {
        include: [{ model: Order }],
      });

      if (!payment) {
        return { valid: false, error: "Payment not found" };
      }

      const orderAmount = parseFloat(payment.Order.totalAmount);
      const paymentAmount = parseFloat(payment.amount);

      if (Math.abs(orderAmount - paymentAmount) > 0.01) {
        return {
          valid: false,
          error: "Payment amount mismatch",
          expected: orderAmount,
          received: paymentAmount,
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  static async canRetryPayment(orderID) {
    try {
      const order = await Order.findByPk(orderID, {
        include: [{ model: Payment }],
      });

      if (!order) {
        return { canRetry: false, reason: "Order not found" };
      }

      if (order.status !== "Pending") {
        return {
          canRetry: false,
          reason: `Order status is ${order.status}`,
        };
      }

      // Check number of failed attempts
      const failedAttempts = order.Payments.filter((p) => p.status === "Failed").length;
      const maxRetries = 3; // MAX TRIES ALLOWED

      if (failedAttempts >= maxRetries) {
        return {
          canRetry: false,
          reason: `Maximum retry attempts (${maxRetries}) exceeded`,
        };
      }

      return { canRetry: true };
    } catch (error) {
      return { canRetry: false, reason: error.message };
    }
  }

  static async createPaymentAttempt(orderID, paymentProvider) {
    try {
      const order = await Order.findByPk(orderID);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "Pending") {
        throw new Error(`Cannot create payment for order with status: ${order.status}`);
      }

      const payment = await Payment.create({
        orderID: order.id,
        paymentProvider,
        amount: order.totalAmount,
        currency: "INR",
        status: "Pending",
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  /*static async createGooglePayPaymentIntent(orderID) {
    try {
      // const gpay = require('gpay')(process.env.GPAY_SECRET_KEY);

      const order = await Order.findByPk(orderID);
      if (!order) {
        throw new Error("Order not found");
      }

      // Create gpay payment intent
      // const paymentIntent = await gpay.paymentIntents.create({
      //   amount: Math.round(order.totalAmount * 100), // Convert to cents
      //   currency: 'inr',
      //   metadata: {
      //     orderID: order.id,
      //     orderNumber: order.orderNumber,
      //   },
      // });

      // Create payment record
      const payment = await Payment.create({
        orderID: order.id,
        paymentProvider: "gpay",
        // transactionID: paymentIntent.id,
        amount: order.totalAmount,
        currency: "INR",
        status: "Pending",
        metadata: {
          // clientSecret: paymentIntent.client_secret,
        },
      });

      return {
        payment,
        // clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw error;
    }
  }*/

  /*static async createPhonePeOrder(orderID) {
    try {
      // const PhonePe = require('PhonePe');
      // const PhonePe = new PhonePe({
      //   key_id: process.env.PhonePe_KEY_ID,
      //   key_secret: process.env.PhonePe_KEY_SECRET,
      // });

      const order = await Order.findByPk(orderID);
      if (!order) {
        throw new Error("Order not found");
      }

      // Create PhonePe order
      // const PhonePeOrder = await PhonePe.orders.create({
      //   amount: Math.round(order.totalAmount * 100), // Convert to paise
      //   currency: 'INR',
      //   receipt: order.orderNumber,
      //   notes: {
      //     orderID: order.id,
      //   },
      // });

      // Create payment record
      const payment = await Payment.create({
        orderID: order.id,
        paymentProvider: "PhonePe",
        // transactionID: PhonePeOrder.id,
        amount: order.totalAmount,
        currency: "INR",
        status: "Pending",
        metadata: {
          // PhonePeOrderID: PhonePeOrder.id,
        },
      });

      return {
        payment,
        // PhonePeOrder,
      };
    } catch (error) {
      throw error;
    }
  }*/
}

module.exports = PaymentService;