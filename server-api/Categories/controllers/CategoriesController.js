const { findAllCategories } = require("../../common/models/Category");

module.exports = {
    getCategories: async (req, res) => {
        try {
            const categories = await findAllCategories({}, {
                attributes: ["id", "name"]
            });

            return res.status(200).json(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            return res.status(500).json({
                message: "Failed to fetch categories"
            });
        }
    }
};
