const OrderController = require('./controllers/OrderController');
const SellerOrders = require('./controllers/SellerOrders');

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

router.put("/seller/orders/:orderId/status",
    SellerOrders.updateOrderStatus
);

router.post("/payment/initiate", 
    OrderController.initiatePayment
);

router.post("/payment/update",
    OrderController.updatePaymentStatus
);

router.get("/:orderID/payments", 
    OrderController.getOrderPayments
);

module.exports = router;
