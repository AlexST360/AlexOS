/* ============================================================
   AlexOS MarketService — Tipo de cambio USD/CLP
   Fuente: exchangerate-api.com (plan gratuito, sin key)
   TTL 300 s (5 min)
   ============================================================ */
const MarketService = (() => {
  const CACHE_KEY = 'forex_usd_clp';
  const TTL_MS    = 300_000;
  const URL       = 'https://api.exchangerate-api.com/v4/latest/USD';

  async function fetch_() {
    if (!ApiCache.isStale(CACHE_KEY)) {
      return { data: ApiCache.get(CACHE_KEY), fromCache: true };
    }

    try {
      const res  = await fetch(URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const clp = json.rates?.CLP ?? null;

      /* Cruces BTC/CLP y ETH/CLP usando el caché de crypto si existe */
      const cryptoData = ApiCache.get('crypto_prices');
      const btcClp = (clp && cryptoData?.bitcoin?.usd)
        ? Math.round(cryptoData.bitcoin.usd  * clp)
        : null;
      const ethClp = (clp && cryptoData?.ethereum?.usd)
        ? Math.round(cryptoData.ethereum.usd * clp)
        : null;

      const data = {
        usdClp:    clp,
        btcClp,
        ethClp,
        updatedAt: json.time_last_updated ?? null,
        base:      json.base ?? 'USD',
      };

      ApiCache.set(CACHE_KEY, data, TTL_MS);
      return { data, fromCache: false, error: null };
    } catch (err) {
      const stale = ApiCache.get(CACHE_KEY);
      return { data: stale, fromCache: true, error: err.message, stale: true };
    }
  }

  return { fetch: fetch_ };
})();
