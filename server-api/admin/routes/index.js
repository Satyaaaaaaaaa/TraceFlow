const router = require("express").Router();

const isAuthenticatedMiddleware = require("../../common/middlewares/IsAuthenticatedMiddleware");
const CheckPermissionMiddleware = require("../../common/middlewares/CheckPermissionMiddleware");
const { roles } = require("../../config")

const AdminDashboardRoutes = require("./AdminDashboardRoutes")
const AdminProductRoutes = require("./AdminProductRoutes")
const AdminUserRoutes = require("./AdminUserRoutes")

// Lock ALL admin routes
router.use(isAuthenticatedMiddleware.check);
router.use(CheckPermissionMiddleware.has(roles.ADMIN));

// Mount sub-routes
router.use("/dashboard", AdminDashboardRoutes);
router.use("/users", AdminUserRoutes);
router.use("/products", AdminProductRoutes);

module.exports = router;
