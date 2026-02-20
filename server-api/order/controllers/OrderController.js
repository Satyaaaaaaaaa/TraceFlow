const { Cart, CartItem, Order, Product, OrderItem ,User, Image } = require('../../common/models/associations');
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const { Op } = require("sequelize");

const { formatProductImages } = require("../../products/utils/formatProductImages");

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
    if (!authHeader)
        return res.status(401).json({ message: "Authorization header missing" });

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
        decoded = jwt.verify(token, jwtSecret);
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userID = decoded.userId;
    const { products, totalAmount, status, addressID } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0)
        return res.status(400).json({ message: "Invalid or missing products" });

    if (!totalAmount || !status || !addressID)
        return res.status(400).json({ message: "Missing required fields" });

    try {
        const order = await Order.create({
            userID,
            totalAmount,
            status,
            addressID
        });

        await Promise.all(products.map(p =>
            OrderItem.create({
                orderID: order.id,
                productID: p.productID,
                quantity: p.quantity
            })
        ));

        const cart = await Cart.findOne({ where: { userId: userID } });
        if (cart) {
            await CartItem.destroy({ where: { cartID: cart.id } });
        }

        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        return res.status(400).json({
            message: "Order creation failed",
            error: error.message
        });
    }
},

// ================= GET USER ORDERS =================

getOrders: async (req, res) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const userID = decoded.userId;

    try {

        const orders = await Order.findAll({
            where: { userID },
            include: [{
                model: OrderItem,
                attributes: ['quantity'],
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'price'],
                    include: [{
                        //Todo --> use the associations from associantions.js
                        association: Product.associations.Images,
                        where: { position: 0 },
                        required: false,
                        attributes: ['id', 'uuid', 'position']
                    }]
                }]
            }]
        });

        const formattedOrders = orders.map(order => {
            const o = order.toJSON();

            o.OrderItems = o.OrderItems.map(item => {

                item.Product = formatProductImages(item.Product, req);

                item.Product.image =
                    item.Product.Images?.[0]?.imageUrl || null;

                delete item.Product.Images;

                return item;
            });

            return o;
        });

        return res.status(200).json({
            status: true,
            data: formattedOrders
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
