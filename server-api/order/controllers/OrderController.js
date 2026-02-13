const { parse } = require('dotenv');
const { Cart, CartItem, Order, Product, OrderItem ,User,Address,Payment } = require('../../common/models/associations');
const sequelize = require("../../common/models/SequelizeInstance");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

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
        if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const userID = decoded.userId;
        //console.log("User ID:", userID);
        //console.log("Request Body:", req.body);

        const { products, addressID, usersID } = req.body;

        if (!products || !addressID || !userID || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                status:false, 
                message: "Invalid or missing 'products' array or 'usersID' or 'addressID'" });
        }
        //if (!totalAmount || !status || !addressID) {
            //return res.status(400).json({ message: "Missing one of: totalAmount, status, addressID" });
        //}
        const transaction = await sequelize.transaction();
        try {

            // ✅ 1. VALIDATE ADDRESS BELONGS TO USER
            const address = await Address.findOne({
                where: { id: addressID, userID },
                transaction
            });

            if (!address) {
                throw new Error('Address not found or does not belong to user');
            }

            // ✅ 2. FETCH PRODUCTS FROM DATABASE
            const productIDs = products.map(p => p.productID);
            const dbProducts = await Product.findAll({
                where: { id: productIDs },
                transaction
            });

            // ✅ 3. VALIDATE ALL PRODUCTS EXIST
            if (dbProducts.length !== productIDs.length) {
                throw new Error('One or more products not found');
            }

            // ✅ 4. BUILD ORDER ITEMS DATA WITH PRICES FROM DATABASE
            let totalAmount = 0;
            let orderItemsData = [];

            for (const item of products) {
                const product = dbProducts.find(p => p.id === item.productID);
                if (!product) { 
                    throw new Error(`Product with ID ${item.productID} not found`); 
                }
                const itemTotal = parseFloat(product.price) * item.quantity;
                totalAmount += itemTotal;
                
                orderItemsData.push({
                    productID: item.productID,
                    quantity: item.quantity,
                    priceUnit: "INR"
                }); 
            }

            // ✅ 5. CREATE ORDER NUMBER
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // ✅ 6. CREATE ORDER
            const order  = await Order.create({ 
                orderNumber,
                userID, 
                totalAmount, 
                addressID, 
                status: "Pending" 
            }, { transaction });

            const orderID = order.id;

            // ✅ 7. CREATE ORDER ITEMS
            const orderItems = await Promise.all(
                orderItemsData.map( item => {
                async (product) => {
                    OrderItem.create({
                        orderID,
                        ...item
                    }, { transaction });
                }
             })
            );
            
            // ✅ 8. CREATE INITIAL PAYMENT RECORD
            const payment = await Payment.create({
                orderID: order.id,
                amount: totalAmount,
                currency: 'INR',
                status: 'Pending',
                paymentProvider: 'Google Pay' //FOR TESTING PURPOSES WILL CHANGE LATER ACCORDINGLY  
            }, { transaction });

            // ✅ 9. CLEAR CART
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

            // ✅ 10. COMMIT TRANSACTION
            await transaction.commit();
            
            return res.status(201).json({
                status: true,
                message: "Order created successfully. Please complete payment.",
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    status: order.status
                },
                orderItems: orderItems,
                paymentID: payment.id,  
                nextStep: 'INITIATE_PAYMENT'
            });
            
        } catch (error) {
            console.error("Order creation failed:", error);
            return res.status(400).json({
                message: "An error occurred while creating an order",
                errorMessage: error.message,
                stack: error.stack
            });
        }
    },

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
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: false,
                message: "Authorization header missing or malformed"
            });
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: "Invalid or expired token"
            });
        }

        const userID = decoded.userId;
        console.log("User ID:", userID);

        try {
            const orders = await Order.findAll({
                where: { userID },
                include: [
                    {
                        model: OrderItem,
                        attributes: ['quantity'],
                        include: [{
                            model: Product,
                            attributes: ['id', 'name', 'image', 'price']
                        }]
                    }
                ]
            });
        
            return res.status(200).json({
                status: true,
                data: orders.map(order => order.toJSON())
            });
        
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },


    getOrder: async (req, res) => {
        const { id } = req.params;
        try {
            const order = await findOrder({ id });
            if (!order) {
                return res.status(404).json({
                    status: false,
                    error: "Order not found!"
                });
            }
            return res.status(200).json({
                status: true,    
                data: order.toJSON()
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
            if (!authHeader) return res.status(401).json({ status: false, error: "Authorization header missing" });
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, jwtSecret);
            const sellerId = decoded.userId;

            // Find products for seller via UserProduct association
            const sellerProducts = await Product.findAll({
                include: [{
                    model: User,
                    where: { id: sellerId },
                    attributes: []
                }],
                attributes: ['id']
            });

            const productIds = sellerProducts.map(p => p.id);
            if (productIds.length === 0) {
                return res.status(200).json({ status: true, data: [], message: "You haven't added any products yet." });
            }

            const orderItems = await OrderItem.findAll({
                where: { productID: productIds },
                include: [
                    {
                        model: Order,
                        required: true,
                        include: [{ model: User, attributes: ['id', 'username', 'email'] }]
                    },
                    {
                        model: Product,
                        attributes: ['id', 'name', 'price', 'image']
                    }
                ]
            });

            const groupedOrders = {};
            orderItems.forEach(item => {
                const orderId = item.orderID;
                if (!groupedOrders[orderId]) {
                    groupedOrders[orderId] = {
                        orderID: orderId,
                        buyer: item.Order.user,
                        status: item.Order.status,
                        items: []
                    };
                }
                console.log("ORDER KEYS:", Object.keys(item.Order.dataValues));
                groupedOrders[orderId].items.push({ product: item.Product, quantity: item.quantity });
            });

            return res.status(200).json({ status: true, data: Object.values(groupedOrders) });

        } catch (error) {
            return res.status(400).json({ status: false, error: error.message });
        }
    }
};