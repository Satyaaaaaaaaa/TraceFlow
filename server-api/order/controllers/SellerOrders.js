const { Order, OrderItem, Product, User } = require('../../common/models/associations');
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const { transferOwnershipWithTraceability } = require("../../services/productService")


const getOrdersForSeller = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);

        const sellerId = decoded.userId;

        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    include: [{
                        model: User,
                        through: { attributes: [] },
                        where: { id: sellerId },
                        required: true
                    }]
                }]
            }]
        });

        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching seller orders:", error);
        next(error);
    }
};

const getOrders = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);

        const userID = decoded.userId;

        const orders = await Order.findAll({
            where: { userID },
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'image', 'price']
                }],
                attributes: ['quantity']
            }]
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
};

const updateOrderStatus = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);
        const sellerId = decoded.userId;

        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findByPk(orderId);

        console.log(orderId);
        
        //OWNERSHIP TRANSFER ONLY ON DELIVERY
        if(status === "Delivered") {
            
            // Fetch both users (Buyer and Seller) in one go
            const users = await User.findAll({
                where: {
                    id: [order.userID, sellerId]
                },
                attributes: ['id', 'username']
            });
            // Map the results back to easy-to-use variables
            const buyer = users.find(u => u.id === order.userID);
            const seller = users.find(u => u.id === sellerId);

            if (!buyer || !seller) {
                return res.status(404).json({ error: "Buyer or Seller not found in database" });
            }

            const buyerName = buyer.username;
            const sellerName = seller.username;

            await transferOwnershipWithTraceability(
                orderId,     //asset
                buyerName,   //new owner
                sellerName   //current owner
            );
        }

        //UPDATE DB AFTER FABRIC
        order.status = status;
        await order.save();

        return res.status(200).json({
            message: "Order status updated",
            order, sellerId
        });

    } catch (error) {
        console.error("Update order error:", error);
        return res.status(500).json({ error: error.message });
    }
};





module.exports = {
    getOrdersForSeller,
    getOrders,
    updateOrderStatus
};