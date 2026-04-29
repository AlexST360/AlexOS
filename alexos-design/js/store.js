/* ============================================================
   AlexOS Store — Capa de datos con localStorage
   Esquema de datos completo + defaults + CRUD helpers
   ============================================================ */

const Store = (() => {

  const PFX = 'alexos_v1_';

  /* ─── Datos por defecto ─────────────────────────────────── */
  const DEFAULTS = {

    dayos: {
      energy: 'alta',
      priorities: [
        { id: 'p1', text: 'Cerrar propuesta comercial Nexus', done: false },
        { id: 'p2', text: 'Revisar modelo financiero Q2',     done: false },
        { id: 'p3', text: 'Llamada de seguimiento con Marcos', done: false }
      ],
      kanban: {
        todo:  [
          { id: 'k1', title: 'Revisar contratos pendientes', badge: 'Media',    color: 'neutral', createdAt: Date.now() },
          { id: 'k2', title: 'Actualizar perfil LinkedIn',   badge: 'Personal', color: 'sky',     createdAt: Date.now() }
        ],
        doing: [
          { id: 'k3', title: 'Modelo financiero Q2', progress: 68, badge: 'Alta',  color: 'gold',   createdAt: Date.now() },
          { id: 'k4', title: 'Deck inversores',       progress: 32, badge: 'Media', color: 'sunset', createdAt: Date.now() }
        ],
        done:  [
          { id: 'k5', title: 'Reunión matutina de equipo', doneAt: '8:30 AM' },
          { id: 'k6', title: 'Inbox zero',                 doneAt: '9:00 AM' },
          { id: 'k7', title: 'Meditación 10 min',          doneAt: '7:15 AM' }
        ]
      },
      pomodoro: { sessionsToday: 4, targetSessions: 8 },
      reflection: {}   // keyed by 'YYYY-MM-DD'
    },

    wealthos: {
      assets: [
        { id: 'a1', name: 'S&P 500 ETF (VOO)',    type: 'Renta Variable', value: 124000, change: 11.2,  emoji: '🇺🇸', pct: 24 },
        { id: 'a2', name: 'Apto. CDMX · Polanco', type: 'Inmobiliario',   value:  95000, change:  4.8,  emoji: '🏠',  pct: 18 },
        { id: 'a3', name: 'Bitcoin (BTC)',          type: 'Crypto',         value:  43000, change: 34.1,  emoji: '₿',  pct:  8 },
        { id: 'a4', name: 'CETES 90 días',          type: 'Renta Fija',     value:  78000, change: 11.5,  emoji: '📊', pct: 15 },
        { id: 'a5', name: 'Oro (GLD ETF)',           type: 'Commodity',      value:  26000, change: 18.3,  emoji: '🥇', pct:  5 }
      ],
      monthlyIncome:  18500,
      monthlyExpense:  5900,
      savingsRate:    68
    },

    projectos: {
      tasks: {
        backlog: [
          { id: 'pt1', title: 'Integrar Claude API',          points: 8, badge: 'gold',    progress: 0  },
          { id: 'pt2', title: 'Diseño mobile responsive',     points: 5, badge: 'sky',     progress: 0  },
          { id: 'pt3', title: 'Tests E2E suite',              points: 3, badge: 'neutral',  progress: 0  }
        ],
        doing: [
          { id: 'pt4', title: 'Design System v2',   points: 5, badge: 'gold',    progress: 82 },
          { id: 'pt5', title: 'Router SPA hash',    points: 3, badge: 'emerald', progress: 55 },
          { id: 'pt6', title: 'Módulo DayOS JS',    points: 3, badge: 'sky',     progress: 40 }
        ],
        done: [
          { id: 'pt7', title: 'Auth JWT + refresh tokens', points: 5, badge: 'emerald', progress: 100 },
          { id: 'pt8', title: 'Setup CI/CD pipeline',      points: 3, badge: 'emerald', progress: 100 },
          { id: 'pt9', title: 'DB schema migrations',      points: 3, badge: 'emerald', progress: 100 }
        ]
      }
    },

    secondbrain: {
      books:  [],
      ideas:  [],
      habits: { list: [], log: {} }
    }
  };

  /* ─── Helpers ───────────────────────────────────────────── */

  function _key(ns) { return PFX + ns; }

  function get(ns) {
    try {
      const raw = localStorage.getItem(_key(ns));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }

  function set(ns, val) {
    try {
      localStorage.setItem(_key(ns), JSON.stringify(val));
    } catch(e) { console.warn('[Store] write error', e); }
    return val;
  }

  /* Carga namespace: usa localStorage o defaults (copia profunda) */
  function load(ns) {
    return get(ns) ?? JSON.parse(JSON.stringify(DEFAULTS[ns] ?? {}));
  }

  /* Guarda namespace completo */
  function save(ns, val) { return set(ns, val); }

  /* Update parcial de un namespace */
  function update(ns, fn) {
    const data = load(ns);
    const updated = fn(data);
    save(ns, updated);
    return updated;
  }

  /* UID simple */
  function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

  /* Fecha ISO (YYYY-MM-DD) */
  function today() { return new Date().toISOString().slice(0,10); }

  /* Formato relativo de fecha */
  function relDate(ts) {
    const diff = Date.now() - ts;
    if (diff < 3600000)  return `hace ${Math.floor(diff/60000)} min`;
    if (diff < 86400000) return `hace ${Math.floor(diff/3600000)} h`;
    if (diff < 172800000) return 'ayer';
    return new Date(ts).toLocaleDateString('es-MX', { day:'numeric', month:'short' });
  }

  /* Reset completo (dev) */
  function reset() {
    Object.keys(DEFAULTS).forEach(ns => localStorage.removeItem(_key(ns)));
  }

  return { load, save, update, uid, today, relDate, reset, DEFAULTS };
})();

/* Exponer para debug */
window.__store = Store;
