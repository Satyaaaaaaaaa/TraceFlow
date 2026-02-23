const { createProductWithTraceability } = require("../../services/productService");
const { updateProductBCStatus } = require("../../common/models/ProductBlockchainStatus");

async function syncProduct(product, username) {
  const result = await createProductWithTraceability(
    product.id,
    product.name,
    username
  );

  await updateProductBCStatus(
    { productId: product.id },
    { blockchainStatus: true }
  );

  return result;
}

module.exports = { syncProduct };