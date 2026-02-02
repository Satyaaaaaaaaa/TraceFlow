require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const client = require("./meili");

async function clearIndex() {
  await client.index("products").deleteAllDocuments();
  console.log("🧹 Products index cleared");
}

clearIndex()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
