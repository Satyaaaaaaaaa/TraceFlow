const router = require('express').Router();

// Middleware Imports
const isAuthenticatedMiddleware = require("./../common/middlewares/IsAuthenticatedMiddleware");
const SchemaValidationMiddleware = require("../common/middlewares/SchemaValidationMiddleware");
const CheckPermissionMiddleware = require("../common/middlewares/CheckPermissionMiddleware");


// Controller Imports
const ProductController = require("./controllers/ProductController");

// Schema Imports
const createProductPayload = require("./schemas/createProductPayload");
const updateProductPayload = require("./schemas/updateProductPayload");
const { roles } = require('../config');

router.get(
    "/",
    // isAuthenticatedMiddleware.check,
    ProductController.getProducts
)

router.get(
    "/:id",
    isAuthenticatedMiddleware.check,
    ProductController.getProduct
)

// New route to get products by the authenticated user
router.get(
    "/user/products",
    isAuthenticatedMiddleware.check,
    ProductController.getProductsByUserId
)
router.post(
    "/",
    isAuthenticatedMiddleware.check,
    // CheckPermissionMiddleware.has(roles.ADMIN),
    SchemaValidationMiddleware.verify(createProductPayload),
    ProductController.createProduct
)

router.patch(
    "/:id",
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN),
    SchemaValidationMiddleware.verify(updateProductPayload),
    ProductController.updateProduct
)

router.delete(
    "/:id",
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN),
    ProductController.deleteProduct
)

module.exports = router;