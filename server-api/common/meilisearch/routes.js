const router = require("express").Router();
const SearchController  = require("./controller/SearchController");

router.get("/", 
    SearchController.searchProducts
);

module.exports = router;
