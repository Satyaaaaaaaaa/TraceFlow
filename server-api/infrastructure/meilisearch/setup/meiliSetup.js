const client = require("../meili");

async function setupProductIndex() {
  const index = client.index("products");

  await index.updateSearchableAttributes([
    "name",
    "description",
    "categoryNames",
    "price"
  ]);

  await index.updateFilterableAttributes([
    "categoryNames",
    "price"
  ]);

  console.log("✅ Meilisearch products index ready");
}

setupProductIndex().catch(console.error);