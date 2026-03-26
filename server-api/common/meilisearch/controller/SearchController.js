const client = require("../../meilisearch/meili");

module.exports = {
  searchProducts: async (req, res) => {
    try {
      const q = req.query.q?.trim() || "";

      // pagination params
      const page = Math.max(parseInt(req.query.page) || 0, 0); // handles negative values
      const limit = Math.min(
        Math.max(parseInt(req.query.limit) || 10, 1),
        50
      ); // prevents URL abuse (limit=100000)
      const offset = page * limit;

      // empty query  no search
      if (!q) {
        return res.json({
          results: [],
          page,
          limit,
        });
      }

      const result = await client.index("products").search(q, {
        limit,
        offset,
      });

      const total = result.estimatedTotalHits;

      return res.json({
        results: result.hits,
        page,
        limit,
        total, // optional but useful
      });

    } catch (err) {
      console.error("Search error:", err);
      return res.status(500).json({
        message: "Search failed",
      });
    }
  },
  suggestProducts: async (req, res) => {
    try {
      const q = req.query.q?.trim() || "";

      if (!q || q.length < 2) {
        return res.json({
          categories: [],
          products: []
        });
      }

      const index = client.index("products");

      // Category suggestions (already unique ✅)
      const categoryResult = await index.search(q, {
        limit: 5,
        attributesToRetrieve: ["categoryNames"],
      });

      const categories = [
        ...new Set(
          categoryResult.hits.flatMap(item => item.categoryNames || [])
        )
      ].slice(0, 5);

      // Product suggestions (FIXED → now unique ✅)
      const productResult = await index.search(q, {
        limit: 10, // increase limit to ensure enough unique results
        attributesToRetrieve: ["name"],
      });

      const products = [
        ...new Set(
          productResult.hits.map(item => item.name)
        )
      ].slice(0, 5);

      // PRIORITY LOGIC
      if (categories.length > 0) {
        return res.json({
          categories,
          products
        });
      } else {
        return res.json({
          products
        });
      }

    } catch (err) {
      console.error("Suggestion error:", err);
      return res.status(500).json({
        message: "Suggestions failed",
      });
    }
  }
};
