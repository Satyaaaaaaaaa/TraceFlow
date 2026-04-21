const { parse } = require('dotenv');
const { Cart, CartItem, Order, Product, OrderItem ,User,Address,Payment, Image } = require('../../common/models/associations');
const sequelize = require("../../common/models/SequelizeInstance");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const { Op } = require("sequelize");

const { formatProductImages } = require("../../common/utils/formatProductImages");

const OrderService = require("../services/OrderService");
const models = require("../../common/models/associations");

module.exports = {
    // createOrderItem: async (req, res) => {
    //     const { productID, quantity, price, orderID } = req.body;
    //     try {
    //         const orderItem = await createOrderItem({ productID, quantity, price, orderID });
    //         return res.status(201).json({
    //             status: true,
    //             data: orderItem.toJSON()
    //         });
    //     } catch (error) {
    //         return res.status(400).json({
    //             status: false,
    //             error: error.message
    //         });
    //     }
    // },

    createOrder: async (req, res) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        let decoded;

        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const userID = decoded.userId;
        const { products, addressID } = req.body;

        // ✅ Validation
        if (!products || !Array.isArray(products) || products.length === 0 || !addressID) {
            return res.status(400).json({
                status: false,
                message: "Invalid or missing products or addressID"
            });
        }

        const transaction = await sequelize.transaction();

        try {
            // ✅ 1. Validate address
            const address = await Address.findOne({
                where: { id: addressID, userID },
                transaction
            });

            if (!address) {
                throw new Error("Address not found or does not belong to user");
            }

            // ✅ 2. Fetch products
            const productIDs = products.map(p => p.productID);

            const dbProducts = await Product.findAll({
                where: { id: productIDs },
                transaction
            });

            if (dbProducts.length !== productIDs.length) {
                throw new Error("One or more products not found");
            }

            // ✅ 3. Calculate total + prepare order items
            let totalAmount = 0;
            const orderItemsData = [];

            for (const item of products) {
                const product = dbProducts.find(p => p.id === item.productID);

                if (!product) {
                    throw new Error(`Product ${item.productID} not found`);
                }

                const itemTotal = parseFloat(product.price) * item.quantity;
                totalAmount += itemTotal;

                orderItemsData.push({
                    productID: item.productID,
                    quantity: item.quantity,
                    price: product.price,   // ✅ important
                    priceUnit: "INR"
                });
            }

            // ✅ 4. Create order number
            const orderNumber = `ORD-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 6)
                .toUpperCase()}`;

            // ✅ 5. Create order
            const order = await Order.create({
                orderNumber,
                userID,
                totalAmount,
                addressID,
                status: "Pending"
            }, { transaction });

            // ✅ 6. Create order items
            await Promise.all(
                orderItemsData.map(item =>
                    OrderItem.create({
                        orderID: order.id,
                        ...item
                    }, { transaction })
                )
            );

            // ✅ 7. Clear cart
            const cart = await Cart.findOne({
                where: { userId: userID },
                transaction
            });

            if (cart) {
                await CartItem.destroy({
                    where: { cartID: cart.id },
                    transaction
                });
            }

            // ✅ 8. Commit transaction
            await transaction.commit();

            return res.status(201).json({
                status: true,
                message: "Order created successfully",
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    status: order.status
                },
                orderItems: orderItemsData
            });

        } catch (error) {
            await transaction.rollback();

            console.error("Order creation failed:", error);

            return res.status(400).json({
                status: false,
                message: "Order creation failed",
                error: error.message
            });
        }
    },

// ================= GET USER ORDERS =================

    // 1. Initiate Payment
    initiatePayment: async (req, res) => {
        try {
            const { orderID, paymentProvider } = req.body;

            // Get order
            const order = await Order.findByPk(orderID);
            if (!order) {
                return res.status(404).json({ 
                    status: false, 
                    error: 'Order not found' 
                });
            }

            // Check order status
            if (order.status !== 'Pending') {
                return res.status(400).json({ 
                    status: false,
                    error: 'Order is not in pending state' 
                });
            }

            // Create or get existing payment
            let payment = await Payment.findOne({
                where: { 
                    orderID: order.id, 
                    status: 'Pending' 
                }
            });

            if (!payment) {
                payment = await Payment.create({
                    orderID: order.id,
                    paymentProvider,
                    amount: order.totalAmount,
                    currency: 'INR',
                    status: 'Pending'
                });
            } else {
                // Update provider if changed
                await payment.update({ paymentProvider });
            }

            // Here you would integrate with actual payment provider
            // For now, return payment details
            return res.status(200).json({
                status: true,
                paymentID: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                orderNumber: order.orderNumber,
                // In real implementation, include provider-specific data
                // e.g., Razorpay order ID, Stripe client secret, etc.
            });

        } catch (error) {
            return res.status(500).json({ 
                status: false, 
                error: error.message 
            });
        }
    },

    // 2. Update Payment Status (Webhook)
    updatePaymentStatus: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { paymentID, status, transactionID, failureReason } = req.body;

            // Get payment
            const payment = await Payment.findByPk(paymentID, { transaction });
            if (!payment) {
                throw new Error('Payment not found');
            }

            // Update payment
            await payment.update({
                status,
                transactionID,
                paidAt: status === 'Success' ? new Date() : null,
                failureReason: failureReason || null
            }, { transaction });

            // Get and update order
            const order = await Order.findByPk(payment.orderID, { transaction });

            if (status === 'Success') {
                await order.update({
                    status: 'Paid'
                }, { transaction });

                // TODO: Send email notification

            } else if (status === 'Failed') {
                await order.update({
                    status: 'Failed'
                }, { transaction });
            }

            await transaction.commit();

            return res.status(200).json({
                status: true,
                message: 'Payment status updated',
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status
                },
                payment: {
                    id: payment.id,
                    status: payment.status,
                    transactionID: payment.transactionID
                }
            });

        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({ 
                status: false, 
                error: error.message 
            });
        }
    },

    // 3. Get Order Payments
    getOrderPayments: async (req, res) => {
        try {
            const { orderID } = req.params;

            const payments = await Payment.findAll({
                where: { orderID },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                status: true,
                data: payments
            });

        } catch (error) {
            return res.status(500).json({ 
                status: false, 
                error: error.message 
            });
        }
    },

    getOrders: async (req, res) => {

        const userID = req.user.id;

        try {
            const orders = await OrderService.getOrdersByUser(userID, models);

            return res.status(200).json({
                status: true,
                data: orders
            });

        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
// ================= GET SINGLE ORDER =================

getOrder: async (req, res) => {

    const { id } = req.params;

    try {

        const order = await Order.findOne({
            where: { id }
        });

        if (!order)
            return res.status(404).json({
                status: false,
                error: "Order not found"
            });

        return res.status(200).json({
            status: true,
            data: order
        });

    } catch (error) {
        return res.status(400).json({
            status: false,
            error: error.message
        });
    }
},

    updateOrder: async (req, res) => {
        const { id } = req.params;
        const updatedValues = req.body;
        console.log(updatedValues)
        try {
            const order = await Order.findOne({ id });
            if (!order) {
                return res.status(404).json({
                    status: false,
                    error: "Order not found!"
                });
            }
            await Order.update(updatedValues, {where: {id}});
            const updatedOrder = await Order.findOne({ id });
            return res.status(200).json({
                status: true,
                data: updatedOrder.toJSON
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    
    deleteOrder: async (req, res) => {
        console.log("Deleteing Order")
        const { id } = req.params;
        console.log("ID: ", id)
        try {
            const order = await Order.findOne({ id });
            if (!order) {
                return res.status(404).json({
                    status: false,
                    error: "Order not found!"
                });
            }
            await order.destroy();
            return res.status(200).json({
                status: true,
                message: "Order deleted successfully!"
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    getOrdersForSeller: async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: false,
                error: "Authorization header missing"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);
        const sellerId = decoded.userId;

        // Get seller products
        const sellerProducts = await Product.findAll({
            include: [{
                model: User,
                where: { id: sellerId },
                attributes: [],
                through: { attributes: [] }
            }],
            attributes: ['id']
        });

        const productIds = sellerProducts.map(p => p.id);

        if (productIds.length === 0) {
            return res.status(200).json({
                status: true,
                data: [],
                message: "You haven't added any products yet."
            });
        }

        // Get order items containing seller's products
        const orderItems = await OrderItem.findAll({
            where: {
                productID: { [Op.in]: productIds }
            },
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: User,
                        }
                    ]
                },
                {
                    model: Product,
                    include: [
                        {
                            model: Image,
                            as: "Images",
                            required: false
                        }
                    ]
                }
            ]
        });
        // 3️⃣ Group by order
        const groupedOrders = {};

        orderItems.forEach(item => {
            const orderId = item.orderID;

            if (!groupedOrders[orderId]) {
                groupedOrders[orderId] = {
                    orderID: orderId,
                    buyer: item.Order.user,
                    status: item.Order.status,
                    createdAt: item.Order.createdAt,
                    items: []
                };
            }

            groupedOrders[orderId].items.push({
                product: formatProductImages(item.Product.toJSON(), req),
                quantity: item.quantity
            });

            
        });

        return res.status(200).json({
            status: true,
            data: Object.values(groupedOrders)
        });

    } catch (error) {
        console.error("Error fetching seller orders:", error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
}



};