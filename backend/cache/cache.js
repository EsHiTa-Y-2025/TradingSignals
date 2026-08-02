class Cache {
  constructor(ttl = 60000) {
    this.ttl = ttl;
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);

    if (!item) return null;

    const expired = Date.now() - item.timestamp > this.ttl;

    if (expired) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

const cache = new Cache();

export default cache;
