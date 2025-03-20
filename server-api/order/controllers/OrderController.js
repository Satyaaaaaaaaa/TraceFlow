const { Cart, CartItem, Order, Product, OrderItem } = require('../../common/models/associations');
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
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    const { userId } = decoded; // User ID from JWT
    const userID = userId;
    console.log("User ID:", userID)
        try {
            console.log("Creating Order!")
            const {products, totalAmount, status, addressID} = req.body;
            const order = await Order.create({userID, totalAmount, status, addressID});
            console.log("Order Created!, Product ID: ", products)
            const orderID = order.id;
            console.log(orderID)

            const orderItems = await Promise.all(products.map(async product => {
                const { productID, quantity } = product;
                console.log(productID);
                return OrderItem.create({ orderID, productID, quantity });
            }));

            const cart = await Cart.findOne({ where: { userId: userID } });
            if (cart) {
                // Delete all cart items that belong to the found cart
                await CartItem.destroy({ where: { cartID: cart.id } });
                console.log("Cart cleared successfully");
            }

            return res.status(201).json({
                message: "Order created successfully",
                order: order,
                orderItems: orderItems
            })
        } catch(error) {
            return res.status(400).json({
                message: "An errored occured while creating an order",
                errorMessage: error
            })
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
                where:{userID},
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
    }
};
