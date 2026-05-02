/* ============================================================
   AlexOS CryptoService — Precios BTC y ETH via CoinGecko
   Sin API key. TTL 60 s para no quemar el rate limit.
   ============================================================ */
const CryptoService = (() => {
  const CACHE_KEY = 'crypto_prices';
  const TTL_MS    = 60_000;
  const URL       = 'https://api.coingecko.com/api/v3/simple/price' +
                    '?ids=bitcoin,ethereum' +
                    '&vs_currencies=usd' +
                    '&include_24hr_change=true' +
                    '&include_last_updated_at=true';

  /* Historial en memoria: últimas 24 lecturas por coin */
  const _history = { bitcoin: [], ethereum: [] };
  const HISTORY_MAX = 24;

  function _pushHistory(coin, price) {
    _history[coin].push({ price, ts: Date.now() });
    if (_history[coin].length > HISTORY_MAX) _history[coin].shift();
  }

  async function fetch_() {
    if (!ApiCache.isStale(CACHE_KEY)) {
      return { data: ApiCache.get(CACHE_KEY), fromCache: true };
    }

    try {
      const res  = await fetch(URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = {
        bitcoin:  {
          usd:       json.bitcoin?.usd       ?? null,
          change24h: json.bitcoin?.usd_24h_change ?? null,
          updatedAt: json.bitcoin?.last_updated_at ?? null,
        },
        ethereum: {
          usd:       json.ethereum?.usd       ?? null,
          change24h: json.ethereum?.usd_24h_change ?? null,
          updatedAt: json.ethereum?.last_updated_at ?? null,
        },
      };

      ApiCache.set(CACHE_KEY, data, TTL_MS);
      _pushHistory('bitcoin',  data.bitcoin.usd);
      _pushHistory('ethereum', data.ethereum.usd);

      return { data, fromCache: false, error: null };
    } catch (err) {
      /* Devuelve último dato conocido + flag de error */
      const stale = ApiCache.get(CACHE_KEY);
      return { data: stale, fromCache: true, error: err.message, stale: true };
    }
  }

  function getHistory(coin) {
    return [...(_history[coin] || [])];
  }

  return { fetch: fetch_, getHistory };
})();
