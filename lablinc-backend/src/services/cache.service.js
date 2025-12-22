// Cache Service - Redis or in-memory cache
// This is a simple in-memory implementation. For production, use Redis.

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  // Get value from cache
  get(key) {
    // Check if key exists and hasn't expired
    if (this.cache.has(key)) {
      const ttl = this.ttls.get(key);
      if (ttl && Date.now() > ttl) {
        // Expired, remove it
        this.cache.delete(key);
        this.ttls.delete(key);
        return null;
      }
      return this.cache.get(key);
    }
    return null;
  }

  // Set value in cache with optional TTL (in seconds)
  set(key, value, ttl = null) {
    this.cache.set(key, value);
    if (ttl) {
      this.ttls.set(key, Date.now() + (ttl * 1000));
    }
    return true;
  }

  // Delete value from cache
  del(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
    return true;
  }

  // Check if key exists
  has(key) {
    if (this.cache.has(key)) {
      const ttl = this.ttls.get(key);
      if (ttl && Date.now() > ttl) {
        this.cache.delete(key);
        this.ttls.delete(key);
        return false;
      }
      return true;
    }
    return false;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttls.clear();
    return true;
  }

  // Get all keys
  keys() {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Clean expired entries
  cleanExpired() {
    const now = Date.now();
    for (const [key, ttl] of this.ttls.entries()) {
      if (now > ttl) {
        this.cache.delete(key);
        this.ttls.delete(key);
      }
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Clean expired entries every 5 minutes
setInterval(() => {
  cacheService.cleanExpired();
}, 5 * 60 * 1000);

module.exports = cacheService;

// For Redis implementation (uncomment when ready):
/*
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => console.error('Redis error:', err));

module.exports = {
  get: (key) => {
    return new Promise((resolve, reject) => {
      client.get(key, (err, data) => {
        if (err) reject(err);
        resolve(data ? JSON.parse(data) : null);
      });
    });
  },
  set: (key, value, ttl = null) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(value);
      if (ttl) {
        client.setex(key, ttl, data, (err) => {
          if (err) reject(err);
          resolve(true);
        });
      } else {
        client.set(key, data, (err) => {
          if (err) reject(err);
          resolve(true);
        });
      }
    });
  },
  del: (key) => {
    return new Promise((resolve, reject) => {
      client.del(key, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  }
};
*/
