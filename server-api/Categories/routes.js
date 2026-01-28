const router = require('express').Router();
const CategoriesController = require('../Categories/controllers/CategoriesController');

router.get(
    "/fetch-categories",
    CategoriesController.getCategories
)

module.exports = router;