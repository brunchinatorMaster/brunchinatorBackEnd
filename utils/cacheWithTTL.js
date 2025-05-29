const defaultTTL = 60 * 24 * 60 * 60 * 1000; // 60 days

function setWithTTL(cache, key, value, ttl = defaultTTL) {
  cache.set(key, {
    value,
    expires: Date.now() + ttl
  });
}

function getWithTTL(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

module.exports = {
  setWithTTL,
  getWithTTL,
  defaultTTL,
};
