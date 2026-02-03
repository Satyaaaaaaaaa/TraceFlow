const router = require("express").Router();
const SchemaValidation = require("../../common/middlewares/SchemaValidationMiddleware");
const createProductPayload = require("../../products/schemas/createProductPayload");
const updateProductPayload = require("../../products/schemas/updateProductPayload");
const ProductController = require("../../products/controllers/ProductController")
const AdminProductController = require("../controllers/AdminProductController")

//Create new product
router.post(
  "/",
  SchemaValidation.verify(createProductPayload),
  ProductController.createProduct
);
//Cannot create product because the products only belong to a certain seller not to admin because admin is not seller(blockchain)

//Read products
router.get(
  "/", 
  ProductController.getProducts
);
router.get(
  "/:id", 
  AdminProductController.getProductsByUserId
);

//Update products
router.patch(
  "/:id",
  SchemaValidation.verify(updateProductPayload),
  ProductController.updateProduct
);

router.delete("/:id", ProductController.deleteProduct);

module.exports = router;