const { MeiliSearch } = require("meilisearch");
require('dotenv').config();

const client = new MeiliSearch({
  host: process.env.MEILI_HOST || "http://localhost:7700",
  apiKey: process.env.MEILI_MASTER_KEY
});

module.exports = client;
