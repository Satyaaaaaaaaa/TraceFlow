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
};
