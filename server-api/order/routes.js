const OrderController = require('./controllers/OrderController');

const router = require('express').Router();

router.get(
    "/",
    // isAuthenticatedMiddleware.check,
    OrderController.getOrders
)

router.post(
    "/",
    // isAuthenticatedMiddleware.check,
    OrderController.createOrder
)

router.get(
    "/get/:id",
    // isAuthenticatedMiddleware.check,
    OrderController.getOrder
)

router.post(
    "/create",
    // isAuthenticatedMiddleware.check,
    OrderController.createOrder
)

router.patch(
    "/update/:id",
    // isAuthenticatedMiddleware.check,
    OrderController.updateOrder
)

router.delete(
    '/orders/:id', 
    OrderController.deleteOrder
);

router.get('/seller-orders', 
    OrderController.getOrdersForSeller
);

module.exports = router;
