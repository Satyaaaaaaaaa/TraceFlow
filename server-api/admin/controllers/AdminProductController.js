const UserModel = require("../../common/models/User");

module.exports = {
    getProductsByUserId: async (req, res) => {
        try {
            const { id } = req.params; // userId

            const user = await UserModel.findUser({ id });
            if (!user) {
                return res.status(404).json({
                    status: false,
                    error: "User not found",
                });
            }

            const products = await user.getProducts({
                include: ["Categories"],
            });

            return res.status(200).json({
                status: true,
                data: products.map((product) => product.toJSON()),
            });
        } catch (error) {
            return res.status(400).json({
                status: false,
                error: error.message,
            });
        }
    }
};
