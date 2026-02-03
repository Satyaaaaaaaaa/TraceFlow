const UserModel = require("../../common/models/User");
const ProductModel = require("../../common/models/Product");
const OrderModel = require("../../common/models/Order");

module.exports = {
  getDashboardStats: async (req, res) => {
    try {
      const totalUsers = await UserModel.User.count();
      const totalProducts = await ProductModel.Product.count();
      const totalOrders = await OrderModel.Order.count();

      return res.status(200).json({
        status: true,
        data: {
          users: {
            total: totalUsers,
          },
          products: {
            total: totalProducts,
          },
          orders: {
            total: totalOrders,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  },
};
