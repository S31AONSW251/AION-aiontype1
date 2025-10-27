// utilities.js - small, dependency-light utilities exported for testing and reuse
class EventBus {
  constructor() { this.listeners = new Map(); }
  on(ev, fn) {
    if (!this.listeners.has(ev)) this.listeners.set(ev, []);
    this.listeners.get(ev).push(fn);
    return () => this.off(ev, fn);
  }
  off(ev, fn) {
    const fns = this.listeners.get(ev) || [];
    this.listeners.set(ev, fns.filter(x => x !== fn));
  }
  emit(ev, payload) {
    (this.listeners.get(ev) || []).forEach(fn => {
      try { fn(payload); } catch (e) { console.warn('EventBus listener failed', e); }
    });
  }
}

class TTLCache {
  constructor(defaultTTL = 60) {
    this.store = new Map();
    this.defaultTTL = defaultTTL;
    this._cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (v.expires && now > v.expires) this.store.delete(k);
      }
    }, 60 * 1000);
    if (typeof this._cleanupInterval.unref === 'function') this._cleanupInterval.unref();
  }
  set(key, value, ttl = this.defaultTTL) {
    const expires = Date.now() + ttl * 1000;
    this.store.set(key, { value, expires });
  }
  get(key) {
    const rec = this.store.get(key);
    if (!rec) return null;
    if (rec.expires && Date.now() > rec.expires) { this.store.delete(key); return null; }
    return rec.value;
  }
  del(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
  dispose() { clearInterval(this._cleanupInterval); this.clear(); }
}

class ProviderRegistry {
  constructor() { this.providers = new Map(); }
  register(name, adapter) { this.providers.set(name, adapter); }
  get(name) { return this.providers.get(name); }
  async call(name, method, ...args) {
    const provider = this.providers.get(name);
    if (!provider || typeof provider[method] !== 'function') throw new Error('Provider or method not found');
    let timeoutMs = 8000;
    const last = args[args.length - 1];
    if (last && typeof last === 'object' && last.__timeoutMs) {
      timeoutMs = last.__timeoutMs;
      args = args.slice(0, -1);
    }
    const callPromise = (async () => provider[method](...args))();
    const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error('Provider call timed out')), timeoutMs));
    return Promise.race([callPromise, timeoutPromise]);
  }
}

const retryBackoff = async (fn, { retries = 3, baseMs = 200, shouldRetry } = {}) => {
  let attempt = 0;
  while (true) {
    try { return await fn(); } catch (err) {
      if (typeof shouldRetry === 'function' && !shouldRetry(err)) throw err;
      if (++attempt > retries) throw err;
      const wait = baseMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * baseMs);
      await new Promise(r => setTimeout(r, wait));
    }
  }
};

class PluginManager {
  constructor() { this.plugins = []; }
  register(plugin) { this.plugins.push(plugin); }
  async runHook(hookName, ...args) {
    for (const p of this.plugins) {
      if (typeof p[hookName] === 'function') {
        try { await p[hookName](...args); } catch (e) { console.warn('Plugin hook failed', hookName, e); }
      }
    }
  }
}

export { EventBus, TTLCache, ProviderRegistry, retryBackoff, PluginManager };
