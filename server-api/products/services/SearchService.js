const searchClient = require("../../common/meilisearch/meili");
const mapProductToSearch = require("../../common/meilisearch/mapper/productSearchMapper");

async function indexProduct(product) {
  await searchClient
    .index("products")
    .addDocuments([mapProductToSearch(product)]);
}

module.exports = { indexProduct };