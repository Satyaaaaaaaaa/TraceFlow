const router = require("express").Router();
const SearchController  = require("./controller/SearchController");

router.get("/", 
    SearchController.searchProducts
);

router.get("/suggestions",
    SearchController.suggestProducts
);

module.exports = router;
