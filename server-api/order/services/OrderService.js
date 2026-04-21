// services/OrderService.js

const { formatProductImages } = require("../../common/utils/formatProductImages");

async function getOrdersByUser(userID, models, req) {
    const { Order, OrderItem, Product, Image } = models;

    try {
        const orders = await Order.findAll({
            where: { userID },
            include: [
                {
                    model: OrderItem,
                    attributes: ["quantity"],
                    include: [
                        {
                            model: Product,
                            attributes: ["id", "name", "price", "uuid"],
                            include: [
                                {
                                    model: Image,
                                    where: { position: 0 }, //primary image only
                                    required: false,        //don't break if missing
                                    attributes: ["id", "uuid", "position", "extension"],
                                    through: { attributes: [] }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        //Normalize + format images
        const formattedOrders = orders.map(order => {
            const orderJson = order.toJSON();

            orderJson.OrderItems = orderJson.OrderItems.map(item => {
                let product = item.Product;

                //normalize key so formatter always works
                if (!product.Images) {
                    product.Images = product.Image || product.images || [];
                }

                //apply formatter (unchanged)
                product = formatProductImages(product, req);

                item.Product = product;
                return item;
            });

            return orderJson;
        });

        return formattedOrders;

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    getOrdersByUser
};