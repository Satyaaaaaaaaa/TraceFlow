require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const client = require("./meili");

const { Product } = require("../models/Product");
const { Category } = require("../models/Category");

require("../models/associations");

const mapProductToSearch = require("./mapper/productSearchMapper");

async function syncProductsToMeili() {
  const products = await Product.findAll({
    include: [
      {
        model: Category,
        attributes: ["id", "name"]
      }
    ]
  });

  const docs = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,

    categoryNames: p.Categories
      ? p.Categories.map(c => c.name)
      : []
  }));


  await client.index("products").addDocuments(docs);

  console.log(`✅ Synced ${docs.length} products to Meilisearch`);
}

syncProductsToMeili().catch(console.error);
