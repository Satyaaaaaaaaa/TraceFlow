const searchClient = require("../../infrastructure/meilisearch/meili");
const mapProductToSearch = require("../../infrastructure/meilisearch/mapper/productSearchMapper");

async function indexProduct(product) {
  await searchClient
    .index("products")
    .addDocuments([mapProductToSearch(product)]);
}

module.exports = { indexProduct };