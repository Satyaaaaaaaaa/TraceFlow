const { initialise, createProduct, findProduct, updateProduct, findAllProducts, deleteProduct } = require("../../common/models/Product");
const { findProductBCStatus, createProductBCStatus, updateProductBCStatus, ProductBlockchainStatus} = require("../../common/models/ProductBlockchainStatus")
const { findUserBCStatus } = require("../../common/models/UserBlockchainStatus")
const { findUser } = require("../../common/models/User");
const { Category, findAllCategories } = require("../../common/models/Category");
const { Image } = require("../../common/models/associations");

const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const searchClient = require("../../common/meilisearch/meili");
const mapProductToSearch = require("../../common/meilisearch/mapper/productSearchMapper");

const { formatProductImages } = require("../../common/utils/formatProductImages")


const { createProductWithTraceability, getFullProductDetails } = require('../../services/productService');

const { Op } = require("sequelize");

const ProductService = require("../services/ProductService")

module.exports = {
    
    createProduct: async (req, res) => {

        try {
            const result = await ProductService.createProductService(
                req.body,
                req.user
            );

            return res.status(201).json({
                status: true,
                message: result.message,
                data: result.data
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
                    },
                    {
                    //Possible to modularize
                    model: Image,
                    as: "Images",
                    where: { position: 0 },   // primary image
                    required: false,
                    attributes: ["id", "uuid", "position", "extension"],
                    through: { attributes: [] }
                    }
                ],
                distinct: true
            });

            const data = products.map(p =>
                formatProductImages(p.toJSON(), req)
            );

            return res.status(200).json({
                status: true,
                data
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },

    /* ========== TEST API VIA http://localhost:3001/product ================
    ========================= CURSOR PAGINATION =============================
    getProducts: async (req, res) => {
        const cat = req.query.cat;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const cursor = req.query.cursor ? Number(req.query.cursor) : null;

        if (cat && isNaN(Number(cat))) {
            return res.status(200).json({
                status: true,
                data: [],
                pagination: { hasMore: false }
            });
        }

        const categoryId = cat ? Number(cat) : null;

        try {
            const where = {};

            // Cursor logic
            if (cursor) {
                where.id = { [Op.gt]: cursor };
            }

            const products = await findAllProducts(where, {
                limit: limit + 1, // fetch one extra
                order: [["id", "ASC"]],
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

            const hasMore = products.length > limit;
            const slicedProducts = hasMore ? products.slice(0, limit) : products;

            const nextCursor = hasMore
                ? slicedProducts[slicedProducts.length - 1].id
                : null;

            return res.status(200).json({
                status: true,
                data: slicedProducts.map(p => p.toJSON()),
                pagination: {
                    nextCursor,
                    hasMore
                }
            });

        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },*/

    getProduct: async (req, res) => {
        const { id } = req.params;

        try {
            const product = await findProduct(
                { id },
                {
                    include: [
                        {
                            model: ProductBlockchainStatus,
                            where: { blockchainStatus: true }
                        },
                        {
                            model: Image,
                            as: "Images",
                            required: false,
                            attributes: ["id", "uuid", "position", "extension"],
                            through: { attributes: [] }, // hide join table
                            order: [["position", "ASC"]]
                        }
                    ]
                }
            );


            if (!product) {
                return res.status(404).json({
                    status: false,
                    error: "Product not found!"
                });
            }

            const data = formatProductImages(product.toJSON(), req);

            return res.status(200).json({
                status: true,
                data
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
                include: [
                    {
                        model: Image,
                        as: "Images",
                        required: false
                    },
                    {
                        model: Category
                    }
                ]
            });

            const data = products.map(p =>
                formatProductImages(p.toJSON(), req)
            );

            return res.status(200).json({
                status: true,
                data
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
            //CAn we extract userId from databse instead of JWT.
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

            // Sync product to search index (DO NOT block request)
            try {
                await searchClient
                    .index("products")
                    .addDocuments([mapProductToSearch(product)]);
                } catch (searchError) {
                console.error(
                    `Search sync failed for product ${product.id}:`,
                    searchError.message
                );
            }

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
