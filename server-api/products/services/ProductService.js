// services/product.service.js

const  sequelize  = require("../../common/models/SequelizeInstance");
const { createProduct, findProduct } = require("../../common/models/Product");
const { findUser } = require("../../common/models/User");
const { findUserBCStatus } = require("../../common/models/UserBlockchainStatus");
const { createProductBCStatus, findProductBCStatus } = require("../../common/models/ProductBlockchainStatus");
const { findAllCategories } = require("../../common/models/Category");
const { Image } = require("../../common/models/associations");

const blockchainService = require("./BlockchainService");
const searchService = require("./SearchService");

async function createProductService(body, user) {

  const { name, description, price, priceUnit, categoryIds, image_uuids } = body;

  let finalCategoryIds = categoryIds;
  if (!finalCategoryIds || finalCategoryIds.length === 0) finalCategoryIds = [1];

  const userId = user.id;

  //Check user
  const dbUser = await findUser({ id: userId });
  if (!dbUser) throw new Error("User not found!");

  const userBC = await findUserBCStatus({ userId });
  if (!userBC || !userBC.blockchainStatus)
    throw new Error("User not synced with blockchain! Please sync");

  //Transaction for DB operations only
  const product = await sequelize.transaction(async (t) => {

    const newProduct = await createProduct(
      { name, description, price, priceUnit },
      { transaction: t }
    );

    const images = await Image.findAll({
      where: { uuid: image_uuids },
      transaction: t
    });

    if (images.length !== image_uuids.length)
      throw new Error("One or more images not found");

    await newProduct.addImages(images, { transaction: t });

    await createProductBCStatus(newProduct.id, { transaction: t });

    await dbUser.addProduct(newProduct, { transaction: t });

    const categories = await findAllCategories(
      { id: finalCategoryIds },
      { transaction: t }
    );

    await newProduct.addCategories(categories, { transaction: t });

    return newProduct;
  });

  // Delegate external systems
  try {
    await blockchainService.syncProduct(product, dbUser.username);
    await searchService.indexProduct(product);
  } catch (error) {
    console.error("External sync failed:", error.message);
  }

  const finalProduct = await findProduct({ id: product.id });
  const productBC = await findProductBCStatus({ productId: product.id });

  return {
    message: productBC.blockchainStatus
      ? "Product created and synced"
      : "Product created, sync pending",
    data: finalProduct.toJSON()
  };
}

module.exports = {
  createProduct: createProductService
};