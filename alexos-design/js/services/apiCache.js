/* ============================================================
   AlexOS ApiCache — Cache en memoria con TTL por clave
   No usa localStorage (datos volátiles de mercado)
   ============================================================ */
const ApiCache = (() => {
  const _store = {};

  function set(key, data, ttlMs) {
    _store[key] = { data, ts: Date.now(), ttl: ttlMs };
  }

  function get(key) {
    const entry = _store[key];
    return entry ? entry.data : null;
  }

  function isStale(key) {
    const entry = _store[key];
    if (!entry) return true;
    return (Date.now() - entry.ts) > entry.ttl;
  }

  function age(key) {
    const entry = _store[key];
    if (!entry) return null;
    return Date.now() - entry.ts;
  }

  function lastUpdated(key) {
    const entry = _store[key];
    if (!entry) return null;
    return new Date(entry.ts);
  }

  return { set, get, isStale, age, lastUpdated };
})();
