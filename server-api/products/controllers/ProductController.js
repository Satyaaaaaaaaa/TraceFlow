const { initialise, createProduct, findProduct, updateProduct, findAllProducts, deleteProduct } = require("../../common/models/Product");
const { findUser } = require("../../common/models/User");
const { findAllCategories } = require("../../common/models/Category");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

module.exports = {
    createProduct: async (req, res) => {
        const { name, description, price, image, categoryIds } = req.body;
        const priceUnit = req.body.priceUnit || "inr";

        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);

        const { userId } = decoded; // User ID from JWT
        try {
            // Create the product
            const product = await createProduct({ name, description, image, price, priceUnit });

            // Associate the product with the user via the join table 'UserProduct'
            const user = await findUser({ id: userId });
            if (!user) {
                throw new Error("User not found");
            }
            await user.addProduct(product);

            // If category IDs are provided, handle the category associations
            if (categoryIds && categoryIds.length > 0) {
                const categories = await findAllCategories({ id: categoryIds });
                await product.addCategories(categories);
                const productWithCategories = await findProduct(product.id, { include: categories });
                return res.status(201).json({
                    status: true,
                    data: productWithCategories.toJSON()
                });
            } else {
                return res.status(201).json({
                    status: true,
                    data: product.toJSON()
                });
            }
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    getProducts: async (req, res) => {
        const { query: filters } = req;
        try {
            const products = await findAllProducts(filters);
            return res.status(200).json({
                status: true,
                data: products.map((product) => product.toJSON())
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    getProduct: async (req, res) => {
        const { id } = req.params;
        try {
            const product = await findProduct({ id });
            if (!product) {
                return res.status(404).json({
                    status: false,
                    error: "Product not found!"
                });
            }
            return res.status(200).json({
                status: true,
                data: product.toJSON()
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    updateProduct: async (req, res) => {
        const { id } = req.params;
        const payload = req.body;

        if (!Object.keys(payload).length) {
            return res.status(400).json({
                status: false,
                error: "Body is empty, hence cannot update the product."
            });
        }
        try {
            await updateProduct({ id }, payload);
            const updatedProduct = await findProduct({ id });
            return res.status(200).json({
                status: true,
                data: updatedProduct.toJSON()
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    deleteProduct: async (req, res) => {
        const { id } = req.params;
        try {
            await deleteProduct({ id });
            return res.status(200).json({
                status: true,
                data: "Product deleted successfully!"
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    
    getProductsByUserId: async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const { userId } = decoded;

    try {
        const user = await findUser({ id: userId });
        if (!user) {
            return res.status(404).json({
                status: false,
                error: "User not found"
            });
        }

        const products = await user.getProducts({
            include: ['Categories'] // include categories if you want
        });

        return res.status(200).json({
            status: true,
            data: products.map((product) => product.toJSON())
        });
    } catch (error) {
        return res.status(400).json({
            status: false,
            error: error.message
        });
    }
}

};
