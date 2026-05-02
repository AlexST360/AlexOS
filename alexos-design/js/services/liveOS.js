/* ============================================================
   AlexOS LiveOS — Coordinador de servicios externos
   Maneja polling independiente por servicio con intervalos
   distintos. Emite callbacks con datos normalizados.
   ============================================================ */
const LiveOS = (() => {
  const INTERVALS = {
    crypto: 60_000,   // 1 min
    market: 300_000,  // 5 min
    github: 600_000,  // 10 min
  };

  let _timers   = {};
  let _cbs      = {};
  let _running  = false;

  /* ─── Helpers internos ────────────────────────────────── */

  async function _pollCrypto() {
    const result = await CryptoService.fetch();
    if (result.data && _cbs.onCrypto) {
      _cbs.onCrypto({
        ...result.data,
        fromCache:  result.fromCache,
        stale:      result.stale ?? false,
        error:      result.error ?? null,
        history:    {
          bitcoin:  CryptoService.getHistory('bitcoin'),
          ethereum: CryptoService.getHistory('ethereum'),
        },
        lastUpdated: ApiCache.lastUpdated('crypto_prices'),
      });
    }
  }

  async function _pollMarket() {
    const result = await MarketService.fetch();
    if (result.data && _cbs.onMarket) {
      _cbs.onMarket({
        ...result.data,
        fromCache:   result.fromCache,
        stale:       result.stale ?? false,
        error:       result.error ?? null,
        lastUpdated: ApiCache.lastUpdated('forex_usd_clp'),
      });
    }
  }

  async function _pollGitHub() {
    const result = await GitHubService.fetch();
    if (result.data && _cbs.onGithub) {
      _cbs.onGithub({
        ...result.data,
        fromCache:   result.fromCache,
        stale:       result.stale ?? false,
        error:       result.error ?? null,
        lastUpdated: ApiCache.lastUpdated('github_repos'),
      });
    }
  }

  /* ─── API pública ─────────────────────────────────────── */

  function startPolling(callbacks = {}) {
    if (_running) stopPolling();
    _cbs    = callbacks;
    _running = true;

    /* Dispara inmediatamente y luego en intervalo */
    _pollCrypto();
    _pollMarket();
    _pollGitHub();

    _timers.crypto = setInterval(_pollCrypto, INTERVALS.crypto);
    _timers.market = setInterval(_pollMarket, INTERVALS.market);
    _timers.github = setInterval(_pollGitHub, INTERVALS.github);
  }

  function stopPolling() {
    Object.values(_timers).forEach(clearInterval);
    _timers  = {};
    _running = false;
  }

  /* Disparo manual de un servicio puntual */
  function refresh(service) {
    if (service === 'crypto') return _pollCrypto();
    if (service === 'market') return _pollMarket();
    if (service === 'github') return _pollGitHub();
  }

  function isRunning() { return _running; }

  return { startPolling, stopPolling, refresh, isRunning };
})();

window.__liveOS = LiveOS; // debug
