const redis = require("./redis");

const cacheService = {
  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);

      if (ttl) {
        await redis.set(key, serialized, "EX", ttl);
      } else {
        await redis.set(key, serialized);
      }
    } catch (err) {
      console.error("Redis SET error:", err);
    }
  },

  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Redis GET error:", err);
      return null;
    }
  },

  async del(key) {
    try {
      await redis.del(key);
    } catch (err) {
      console.error("Redis DEL error:", err);
    }
  },

  // ⚠️ ONLY use this for numeric keys (no JSON)
  async incr(key) {
    try {
      return await redis.incr(key);
    } catch (err) {
      console.error("Redis INCR error:", err);
      return null;
    }
  }
};

module.exports = cacheService;