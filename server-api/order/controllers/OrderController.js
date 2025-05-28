const { Cart, CartItem, Order, Product, OrderItem ,User } = require('../../common/models/associations');
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
    console.log("User ID:", userID);
    console.log("Request Body:", req.body);

    const { products, totalAmount, status, addressID } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Invalid or missing 'products' array" });
    }
    if (!totalAmount || !status || !addressID) {
        return res.status(400).json({ message: "Missing one of: totalAmount, status, addressID" });
    }

    try {
        const order = await Order.create({ userID, totalAmount, status, addressID });
        const orderID = order.id;

        const orderItems = await Promise.all(products.map(async (product) => {
            const { productID, quantity } = product;
            return OrderItem.create({ orderID, productID, quantity });
        }));

        const cart = await Cart.findOne({ where: { userId: userID } });
        if (cart) {
            await CartItem.destroy({ where: { cartID: cart.id } });
            console.log("Cart cleared successfully");
        }

        return res.status(201).json({
            message: "Order created successfully",
            order: order,
            orderItems: orderItems
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

    getOrders: async (req, res) => {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);

        const { userId } = decoded; // User ID from JWT
        const userID = userId;
        console.log("User ID:", userID)
        
        try {
            const orders = await Order.findAll({
                where : {userID},
                include: [
                    {
                        model: OrderItem,
                        
                        include: [{
                            model: Product,
                            attributes: ['id', 'name', 'image', 'price']
                        }],
                        attributes: ['quantity']
                    },
                ]}
            );
            console.log(orders)
            return res.status(200).json({
                status: true,
                data: orders.map((order) => order.toJSON())
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
                    include: [{ model: User, attributes: ['id', 'username', 'email'] }]
                },
                {
                    model: Product,
                    attributes: ['id', 'name', 'price']
                }
            ]
        });

        const groupedOrders = {};
        orderItems.forEach(item => {
            const orderId = item.orderID;
            if (!groupedOrders[orderId]) {
                groupedOrders[orderId] = {
                    orderID: orderId,
                    buyer: item.Order.User,
                    items: []
                };
            }
            groupedOrders[orderId].items.push({ product: item.Product, quantity: item.quantity });
        });

        return res.status(200).json({ status: true, data: Object.values(groupedOrders) });

    } catch (error) {
        return res.status(400).json({ status: false, error: error.message });
    }
}

};