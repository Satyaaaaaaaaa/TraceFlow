const router = require('express').Router();
const CategoriesController = require('./controllers/CategoriesController');

// Get flat list
router.get("/fetch-categories", CategoriesController.getCategories);

// Get hierarchical tree (for sidebar)
router.get("/tree", CategoriesController.getCategoryTree);

// Seed routes
router.post("/seed", CategoriesController.seedCategories);
router.post("/seed/reset", CategoriesController.resetCategories);
router.get("/seed/status", CategoriesController.getSeedStatus);
router.post("/seed/update", CategoriesController.updateCategories);

router.get('/:categoryId/attributes', CategoriesController.getCategoryAttributes);
router.post('/seed-attributes', CategoriesController.seedAttributes); 

module.exports = router;