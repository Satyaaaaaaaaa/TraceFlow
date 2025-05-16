// controllers/cartController.js
const { Cart, CartItem, Product } = require('../../common/models/associations');
const jwtSecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

exports.addToCart = async (req, res) => {
    const {  productId, quantity } = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    const { userId } = decoded; // User ID from JWT
    console.log("Add to Cart UserId:", userId)

    try {
        // Find or create a cart for the user
        let cart = await Cart.findOne({ where: { userId } });
        console.log("Add to Cart Cart:", cart)
        if (!cart) {
            cart = await Cart.create({ userID: userId });
        }
        console.log("Add to Cart Cart:", cart)

        // Check if the product already exists in the cart
        let cartItem = await CartItem.findOne({ where: { cartID: cart.id, productID: productId } });
        if (cartItem) {
            // Update the quantity if the product already exists
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Create a new cart item if the product doesn't exist
            cartItem = await CartItem.create({ cartID: cart.id, productID: productId, quantity });
        }

        return res.status(200).json({
            status: true,
            message: 'Product added to cart',
            data: cartItem,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'An error occurred while adding to cart',
            error: error.message,
        });
    }
};

exports.removeFromCart = async (req, res) => {
    const { cartItemId } = req.body;
    try {
        const cartItem = await CartItem.findByPk(cartItemId);

        if (!cartItem) {
            return res.status(404).json({
                status: false,
                message: 'Cart item not found',
            });
        }

        await cartItem.destroy();

        return res.status(200).json({
            status: true,
            message: 'Cart item removed',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'An error occurred while removing cart item',
            error: error.message,
        });
    }
};


exports.updateCartItem = async (req, res) => {
    const { cartItemId, quantity } = req.body;

    try {
        const cartItem = await CartItem.findByPk(cartItemId);
        if (!cartItem) {
            return res.status(404).json({
                status: false,
                message: 'Cart item not found',
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        return res.status(200).json({
            status: true,
            message: 'Cart item updated',
            data: cartItem,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'An error occurred while updating cart item',
            error: error.message,
        });
    }
};


exports.viewCart = async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);  
    // var userId = decoded.userId
    // console.log(userId)

    const { userId } = decoded;
    console.log(userId)

    try {
        const cart = await Cart.findOne({
            where: { userID: userId },
            attributes: ['id', 'userID', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: CartItem,
                    attributes: ['id', 'cartID', 'productID', 'quantity', 'createdAt', 'updatedAt'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image', 'price'],
                        },
                    ],
                },
            ],
        });
        console.log("TEST-----------")

        if (!cart) {
            return res.status(404).json({
                status: false,
                message: 'Cart not found',
            });
        }

        return res.status(200).json({
            status: true,
            data: cart,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'An error occurred while fetching the cart',
            error: error.message,
        });
    }
};
