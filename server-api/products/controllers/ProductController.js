const { initialise, createProduct, findProduct, updateProduct, findAllProducts, deleteProduct } = require("../../common/models/Product");
const { findProductBCStatus, createProductBCStatus, updateProductBCStatus, ProductBlockchainStatus} = require("../../common/models/ProductBlockchainStatus")
const { findUserBCStatus } = require("../../common/models/UserBlockchainStatus")
const { findUser } = require("../../common/models/User");
const { Category, findAllCategories } = require("../../common/models/Category");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const { createProductWithTraceability, getFullProductDetails } = require('../../services/productService');

module.exports = {
    createProduct: async (req, res) => {
        const { name, description, price, image, categoryIds } = req.body;

        let finalCategoryIds = categoryIds;
        if (!finalCategoryIds || finalCategoryIds.length === 0) finalCategoryIds = [1];
        
        const priceUnit = req.body.priceUnit || "inr";

        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);
        const { userId } = decoded; // User ID from JWT



        try {
            //Check user
            const user = await findUser({ id: userId });
            if (!user) {
                console.log('User not found!');
                throw new Error("User not found!");
            } 

            const userBC = await findUserBCStatus({ userId });

            if (!userBC || !userBC.blockchainStatus) {
                throw new Error("User not synced with blockchain! Please sync");
            }

            //Create Product in DB first
            const product = await createProduct({ 
                name, 
                description, 
                image, 
                price, 
                priceUnit,
                blockchainStatus: false
            });

            await createProductBCStatus(product.id);

            // Associate the product with the user via the join table 'UserProduct'
            // const user = await findUser({ id: userId });
            await user.addProduct(product);
            
            //Associate with the product categories
            const categories = await findAllCategories({ id: finalCategoryIds });
            await product.addCategories(categories);
            

            //Sync with blockchain.
            try{
                const prodInfoBc = await createProductWithTraceability(product.id, name, user.username);

                // If Fabric succeeds, update status to true
                await product.update({ blockchainStatus: true });
                await updateProductBCStatus(
                    { productId: product.id },
                    { blockchainStatus: true }
                );

                console.log(`Product ${prodInfoBc.productId}, ${prodInfoBc.productName} Owner: ${prodInfoBc.ownerId} synced to blockchain.`);

            }catch (fabricError) {
                // The product remains in DB with blockchainStatus: false
                console.error("Fabric Error Details:", fabricError.message);
                console.error(`Blockchain sync failed for product ${product.id}. Will retry later.`);
            }         
            
            // Return the product (Status will be true or false depending on Fabric success)
            const finalProduct = await findProduct({id : product.id});
            const productBC = await findProductBCStatus({ productId: product.id });

            
            return res.status(201).json({
                status: true,
                message: productBC.blockchainStatus ? "Product created and synced" : "Product created, sync pending",
                data: finalProduct.toJSON()
            });

        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },
    getProducts: async (req, res) => {

        const cat = req.query.cat;

        if (cat && isNaN(Number(cat))) {
            return res.status(200).json({
                status: true,
                data: []
            });
        }
        const categoryId = cat ? Number(cat) : null;

        console.log("cat param:", categoryId, typeof cat);

        try {
            const products = await findAllProducts({}, {
                include: [
                    {
                        model: Category,
                        ...(categoryId && { where: { id: categoryId } }),
                        required: !!categoryId,
                        through: { attributes: [] }
                    },
                    {
                        model: ProductBlockchainStatus,
                        where: { blockchainStatus: true }
                    }
                ],
                distinct: true
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
    },

    syncProductToBlockchain: async (req, res) => {
        try {
            const { id } = req.params; // Product ID from URL
            const authHeader = req.headers.authorization;
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, jwtSecret);
            const { userId } = decoded;

            // 1. Fetch User and check Blockchain Status
            const user = await findUser({ id: userId });
            const userBC = await findUserBCStatus({ userId });

            if (!user || !userBC || !userBC.blockchainStatus) {
                return res.status(403).json({
                    status: false,
                    error: "User identity not verified on blockchain."
                });
            }

            const product = await findProduct({ id });
                if (!product) {
                    return res.status(404).json({
                        status: false,
                        error: "Product not found!"
                    });
                }

            //  --- FABRIC INTEGRATION ---
            // Attempt to create the traceability asset on the ledger
            console.log(`Starting Blockchain Sync for Product: ${product.name}`);
            const prodInfoBc = await createProductWithTraceability(
                product.id, 
                product.name, 
                user.username
            );

            //Update status in Database
            await product.update({ blockchainStatus: true });
            await updateProductBCStatus(
                { productId: product.id },
                { blockchainStatus: true }
            );
            console.log(`Successfully synced product ${product.id} to ledger.`);

            //Return updated product to Android App
            const finalProduct = await findProduct({ id });
            return res.status(200).json({
                status: true,
                message: "Product synced to blockchain successfully",
                data: finalProduct.toJSON(),
                blockchainData: prodInfoBc
            });

        } catch (error) {
            console.error("Product Blockchain Sync Error:", error);
            return res.status(500).json({
                status: false,
                error: `Blockchain sync failed: ${error.message}`
            });
        }
    },
};
