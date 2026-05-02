/* ============================================================
   AlexOS GitHubService — Repos públicos de AlexST360
   Sin auth: límite 60 req/hora. TTL 600 s (10 min).
   ============================================================ */
const GitHubService = (() => {
  const CACHE_KEY = 'github_repos';
  const TTL_MS    = 600_000;
  const USER      = 'AlexST360';
  const URL       = `https://api.github.com/users/${USER}/repos?sort=updated&per_page=10`;

  async function fetch_() {
    if (!ApiCache.isStale(CACHE_KEY)) {
      return { data: ApiCache.get(CACHE_KEY), fromCache: true };
    }

    try {
      const res  = await fetch(URL, {
        headers: { Accept: 'application/vnd.github+json' }
      });

      /* Exponer rate-limit restante para debugging */
      const remaining = res.headers.get('x-ratelimit-remaining');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      const data = {
        repos: json.map(r => ({
          id:          r.id,
          name:        r.name,
          description: r.description || '',
          url:         r.html_url,
          language:    r.language || null,
          stars:       r.stargazers_count,
          forks:       r.forks_count,
          updatedAt:   r.pushed_at,   // última actividad (push)
          isPrivate:   r.private,
        })),
        rateRemaining: remaining ? parseInt(remaining, 10) : null,
        fetchedAt:     Date.now(),
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
