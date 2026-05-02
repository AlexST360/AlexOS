/* ============================================================
   AlexOS App v3 — Funcionalidad completa con persistencia
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  Router.init();

  /* ════════════════════════════════════════════════════════
     SISTEMA DE TOAST
     ════════════════════════════════════════════════════════ */
  const Toast = {
    container: null,

    init() {
      this.container = document.getElementById('toast-container');
    },

    show(msg, type = 'success', duration = 3000) {
      if (!this.container) return;
      const icons = { success: '✓', error: '✕', info: '◎', warning: '⚠' };
      const colors = {
        success: 'var(--emerald-2)',
        error:   'var(--sunset)',
        info:    'var(--gold-3)',
        warning: 'var(--sunset-2)'
      };

      const t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = `
        <span class="toast-icon" style="color:${colors[type]};">${icons[type]}</span>
        <span class="toast-msg">${msg}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
      `;
      this.container.appendChild(t);

      requestAnimationFrame(() => t.classList.add('visible'));

      setTimeout(() => {
        t.classList.remove('visible');
        setTimeout(() => t.remove(), 350);
      }, duration);
    }
  };

  /* ════════════════════════════════════════════════════════
     SISTEMA DE MODAL
     ════════════════════════════════════════════════════════ */
  const Modal = {
    el: null, title: null, body: null, footer: null,
    onConfirm: null,

    init() {
      this.el     = document.getElementById('modal-overlay');
      this.title  = document.getElementById('modal-title');
      this.body   = document.getElementById('modal-body');
      this.footer = document.getElementById('modal-footer');

      this.el?.addEventListener('click', e => {
        if (e.target === this.el) this.close();
      });

      document.getElementById('modal-close')?.addEventListener('click', () => this.close());
    },

    open({ title, body, confirmLabel, confirmText, confirmClass = 'btn-primary', onConfirm, hideFooter = false }) {
      confirmLabel = confirmLabel || confirmText || 'Guardar';
      if (!this.el) return;
      this.title.textContent = title;
      this.body.innerHTML    = body;
      this.onConfirm         = onConfirm;

      if (hideFooter) {
        this.footer.style.display = 'none';
      } else {
        this.footer.style.display = '';
        const btn = this.footer.querySelector('.modal-confirm');
        if (btn) {
          btn.textContent = confirmLabel;
          btn.className   = `btn ${confirmClass} btn-sm modal-confirm`;
        }
      }

      this.el.classList.add('open');
      const firstInput = this.body.querySelector('input, textarea, select');
      firstInput?.focus();
    },

    close() {
      this.el?.classList.remove('open');
      this.onConfirm = null;
    },

    confirm() {
      if (this.onConfirm) {
        const result = this.onConfirm();
        if (result !== false) this.close();
      } else {
        this.close();
      }
    }
  };

  /* ════════════════════════════════════════════════════════
     HELPERS GLOBALES
     ════════════════════════════════════════════════════════ */
  function fmt$(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function badgeHTML(color, label) {
    return `<span class="badge badge-${color}">${label}</span>`;
  }

  function fmtDate(ts) {
    return Store.relDate(ts);
  }

  /* ════════════════════════════════════════════════════════
     RELOJ, FECHA Y SALUDO DINÁMICO
     ════════════════════════════════════════════════════════ */
  function initClock() {
    const clockEl = document.getElementById('navbar-clock');
    const dateEl  = document.getElementById('today-date');

    if (dateEl) {
      const DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      const n      = new Date();
      dateEl.textContent = `${DAYS[n.getDay()]}, ${n.getDate()} de ${MONTHS[n.getMonth()]}`;
    }

    function tick() {
      if (!clockEl) return;
      const n = new Date();
      clockEl.textContent = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
    }
    tick();
    setInterval(tick, 15000);
  }

  /* ════════════════════════════════════════════════════════
     CLIMA — Santiago Centro (Open-Meteo, sin API key)
     ════════════════════════════════════════════════════════ */
  const WMO_ICON = {
    0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
    45:'🌫️', 48:'🌫️',
    51:'🌦️', 53:'🌦️', 55:'🌧️',
    61:'🌧️', 63:'🌧️', 65:'🌧️',
    71:'❄️', 73:'❄️', 75:'❄️',
    77:'🌨️',
    80:'🌦️', 81:'🌦️', 82:'⛈️',
    85:'🌨️', 86:'🌨️',
    95:'⛈️', 96:'⛈️', 99:'⛈️'
  };

  /* ════════════════════════════════════════════════════════
     LIVEOS — Mercados en vivo + GitHub
     ════════════════════════════════════════════════════════ */

  /* SVG sparkline: recibe array de { price } y dibuja polilinea */
  function _drawSparkline(svgEl, points, isUp) {
    if (!svgEl || points.length < 2) return;
    const w = 64, h = 28;
    const prices = points.map(p => p.price).filter(Boolean);
    if (prices.length < 2) return;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const coords = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const color = isUp ? '#4AAE88' : '#D96E32';
    svgEl.innerHTML = `
      <polyline
        points="${coords.join(' ')}"
        fill="none"
        stroke="${color}"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.85"
      />
      <circle cx="${coords[coords.length-1].split(',')[0]}" cy="${coords[coords.length-1].split(',')[1]}"
              r="2.5" fill="${color}" />
    `;
  }

  function _fmtCLP(n) {
    if (!n) return '—';
    return '$' + Math.round(n).toLocaleString('es-CL');
  }

  function _fmtUSD(n) {
    if (!n) return '—';
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function _ageStr(date) {
    if (!date) return '';
    const sec = Math.round((Date.now() - date.getTime()) / 1000);
    if (sec < 60)   return `hace ${sec}s`;
    if (sec < 3600) return `hace ${Math.floor(sec/60)}min`;
    return `hace ${Math.floor(sec/3600)}h`;
  }

  function renderLiveMarkets(cryptoPayload, marketPayload) {
    const badge   = document.getElementById('markets-live-badge');
    const subEl   = document.getElementById('markets-last-updated');
    const errEl   = document.getElementById('markets-error');
    const errMsg  = document.getElementById('markets-error-msg');
    const hasError = cryptoPayload?.error || marketPayload?.error;

    if (badge) badge.style.display = hasError ? 'none' : 'flex';
    if (errEl) errEl.style.display = hasError ? 'block' : 'none';
    if (hasError && errMsg) errMsg.textContent = `Error: ${cryptoPayload?.error || marketPayload?.error}. Mostrando último dato conocido.`;

    const crypto = cryptoPayload;
    const market = marketPayload;

    if (!crypto?.bitcoin) return;

    /* BTC */
    const btcUp = (crypto.bitcoin.change24h ?? 0) >= 0;
    const btcEl = document.getElementById('live-btc-usd');
    const btcClpEl = document.getElementById('live-btc-clp');
    const btcChEl  = document.getElementById('live-btc-change');
    if (btcEl)    btcEl.textContent    = _fmtUSD(crypto.bitcoin.usd);
    if (btcClpEl) btcClpEl.textContent = market?.btcClp ? _fmtCLP(market.btcClp) + ' CLP' : '— CLP';
    if (btcChEl) {
      const ch = crypto.bitcoin.change24h;
      btcChEl.textContent  = ch != null ? `${ch >= 0 ? '↑' : '↓'} ${Math.abs(ch).toFixed(2)}% 24h` : '— 24h';
      btcChEl.className    = `kpi-change ${ch >= 0 ? 'up' : 'down'}`;
    }
    _drawSparkline(document.getElementById('live-btc-spark'), crypto.history?.bitcoin || [], btcUp);

    /* ETH */
    const ethUp = (crypto.ethereum.change24h ?? 0) >= 0;
    const ethEl   = document.getElementById('live-eth-usd');
    const ethClpEl= document.getElementById('live-eth-clp');
    const ethChEl = document.getElementById('live-eth-change');
    if (ethEl)    ethEl.textContent    = _fmtUSD(crypto.ethereum.usd);
    if (ethClpEl) ethClpEl.textContent = market?.ethClp ? _fmtCLP(market.ethClp) + ' CLP' : '— CLP';
    if (ethChEl) {
      const ch = crypto.ethereum.change24h;
      ethChEl.textContent = ch != null ? `${ch >= 0 ? '↑' : '↓'} ${Math.abs(ch).toFixed(2)}% 24h` : '— 24h';
      ethChEl.className   = `kpi-change ${ch >= 0 ? 'up' : 'down'}`;
    }
    _drawSparkline(document.getElementById('live-eth-spark'), crypto.history?.ethereum || [], ethUp);

    /* Forex */
    const fxEl  = document.getElementById('live-usdclp');
    if (fxEl && market?.usdClp) fxEl.textContent = _fmtCLP(market.usdClp);

    const btcMini = document.getElementById('live-btc-clp-mini');
    const ethMini = document.getElementById('live-eth-clp-mini');
    if (btcMini && market?.btcClp) btcMini.textContent = Math.round(market.btcClp).toLocaleString('es-CL');
    if (ethMini && market?.ethClp) ethMini.textContent = Math.round(market.ethClp).toLocaleString('es-CL');

    if (subEl && crypto.lastUpdated) subEl.textContent = `Actualizado ${_ageStr(crypto.lastUpdated)}`;
  }

  function renderGitHubRepos(payload) {
    const list   = document.getElementById('github-repos-list');
    const badge  = document.getElementById('github-live-badge');
    const sub    = document.getElementById('github-widget-sub');
    const errEl  = document.getElementById('github-error');
    const errMsg = document.getElementById('github-error-msg');
    if (!list) return;

    if (payload.error && !payload.repos) {
      if (errEl) errEl.style.display = 'block';
      if (errMsg) errMsg.textContent = `No se pudo conectar con GitHub: ${payload.error}`;
      return;
    }

    if (errEl) errEl.style.display = 'none';
    if (badge) badge.style.display = 'flex';

    const LANG_COLOR = {
      JavaScript:'#F7DF1E', TypeScript:'#3178C6', Python:'#3572A5',
      CSS:'#563D7C', HTML:'#E34C26', Go:'#00ADD8', Rust:'#DEA584',
    };

    list.innerHTML = '';
    (payload.repos || []).forEach(repo => {
      const langColor = LANG_COLOR[repo.language] || 'var(--text-4)';
      const ago = repo.updatedAt ? Store.relDate(new Date(repo.updatedAt).getTime()) : '—';

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 8px;border-radius:var(--r-lg);transition:background var(--t-base);cursor:pointer;';
      row.innerHTML = `
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
            <p style="font-size:var(--text-xs);font-weight:600;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${repo.name}</p>
            ${repo.language ? `<span style="display:inline-flex;align-items:center;gap:3px;font-size:9px;color:var(--text-4);font-family:var(--font-mono);flex-shrink:0;"><span style="width:7px;height:7px;border-radius:50%;background:${langColor};display:inline-block;"></span>${repo.language}</span>` : ''}
          </div>
          ${repo.description ? `<p style="font-size:10px;color:var(--text-4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${repo.description}</p>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p style="font-size:9px;color:var(--text-4);font-family:var(--font-mono);">${ago}</p>
          ${repo.stars > 0 ? `<p style="font-size:9px;color:var(--gold-3);">★ ${repo.stars}</p>` : ''}
        </div>
      `;
      row.addEventListener('mouseenter', () => row.style.background = 'rgba(200,168,75,0.05)');
      row.addEventListener('mouseleave', () => row.style.background = '');
      row.addEventListener('click', () => window.open(repo.url, '_blank'));
      list.appendChild(row);
    });

    if (sub && payload.repos) {
      sub.textContent = `AlexST360 · ${payload.repos.length} repos · ${_ageStr(payload.lastUpdated)}`;
    }
  }

  /* Caché local para cruzar crypto + market en el render */
  let _latestCrypto = null;
  let _latestMarket = null;

  function initLiveOS() {
    document.getElementById('btn-refresh-markets')?.addEventListener('click', () => {
      LiveOS.refresh('crypto');
      LiveOS.refresh('market');
      Toast.show('Actualizando mercados…', 'info', 2000);
    });

    LiveOS.startPolling({
      onCrypto: payload => {
        _latestCrypto = payload;
        renderLiveMarkets(_latestCrypto, _latestMarket);
      },
      onMarket: payload => {
        _latestMarket = payload;
        renderLiveMarkets(_latestCrypto, _latestMarket);
      },
      onGithub: payload => {
        renderGitHubRepos(payload);
      },
    });
  }

  function initWeather() {
    const widget  = document.getElementById('navbar-weather');
    const iconEl  = document.getElementById('weather-icon');
    const tempEl  = document.getElementById('weather-temp');
    if (!widget) return;

    async function fetchWeather() {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-33.4489&longitude=-70.6693&current=temperature_2m,weathercode&timezone=America%2FSantiago&forecast_days=1';
        const res  = await fetch(url);
        const json = await res.json();
        const cur  = json.current;
        const temp = Math.round(cur.temperature_2m);
        const code = cur.weathercode;
        iconEl.textContent = WMO_ICON[code] ?? '🌡️';
        tempEl.textContent = `${temp}°`;
        widget.style.display = 'flex';
      } catch {
        widget.style.display = 'none';
      }
    }

    fetchWeather();
    setInterval(fetchWeather, 15 * 60 * 1000); // actualiza cada 15 min
  }

  function updateGreeting() {
    const h           = new Date().getHours();
    const greetEl     = document.getElementById('greeting-text');
    const ctxEl       = document.getElementById('energy-ctx');
    const badgeEl     = document.getElementById('hero-badge');

    const greeting = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
    if (greetEl) greetEl.textContent = greeting;

    const dayos = Store.load('dayos');
    const total = dayos.priorities.filter(p => p.text?.trim()).length;
    const done  = dayos.priorities.filter(p => p.done).length;

    // Badge de celebración
    if (badgeEl) {
      if (total > 0 && done === total) {
        badgeEl.textContent = '✦ Día completado';
        badgeEl.style.display = 'inline-flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // Mensaje contextual (no sobreescribe si el usuario lo editó con energía)
    if (!ctxEl || ctxEl.dataset.energySet) return;

    let msg = '';
    if (total > 0 && done === total) {
      msg = 'Todas las prioridades completadas — gran día, Alex';
    } else if (done > 0 && total > 0) {
      msg = `${done} de ${total} prioridades listas — sigue el momentum`;
    } else if (h < 9) {
      msg = 'Comienza con tu tarea de mayor impacto';
    } else if (h < 12) {
      msg = 'Bloque de máximo rendimiento — aprovéchalo bien';
    } else if (h < 15) {
      msg = 'Tarde productiva — cierra los pendientes importantes';
    } else if (h < 19) {
      msg = 'Hora de revisar y preparar el cierre del día';
    } else {
      msg = 'Momento ideal para la reflexión del día';
    }
    ctxEl.textContent = msg;
  }

  /* ════════════════════════════════════════════════════════
     DAYOS — ENERGÍA
     ════════════════════════════════════════════════════════ */
  function initEnergy() {
    const data = Store.load('dayos');
    const btns = document.querySelectorAll('.btn-energy');
    const ctx  = document.getElementById('energy-ctx');

    // Restaurar estado guardado
    btns.forEach(b => b.classList.toggle('active', b.dataset.energy === data.energy));

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        Store.update('dayos', d => { d.energy = btn.dataset.energy; return d; });

        const msgs = {
          alta:  '⚡ Energía alta — bloquea tiempo de trabajo profundo sin interrupciones',
          media: '◎ Energía media — enfócate en tareas de mediano impacto',
          baja:  '◌ Energía baja — tareas ligeras, revisiones y recuperación'
        };
        if (ctx) {
          ctx.dataset.energySet = '1';
          ctx.textContent = msgs[btn.dataset.energy];
        }
      });
    });

    // Mostrar mensaje según energía guardada o dejar al saludo dinámico
    if (ctx && data.energy) {
      const msgs = {
        alta:  '⚡ Energía alta — bloquea tiempo de trabajo profundo sin interrupciones',
        media: '◎ Energía media — enfócate en tareas de mediano impacto',
        baja:  '◌ Energía baja — tareas ligeras, revisiones y recuperación'
      };
      ctx.dataset.energySet = '1';
      ctx.textContent = msgs[data.energy];
    }
  }

  /* ════════════════════════════════════════════════════════
     DAYOS — PRIORIDADES (lista dinámica)
     ════════════════════════════════════════════════════════ */
  function initPriorities() {
    renderPriorities();

    document.getElementById('btn-add-priority')?.addEventListener('click', openAddPriorityModal);
    document.getElementById('btn-add-priority-empty')?.addEventListener('click', openAddPriorityModal);
  }

  function renderPriorities() {
    const data     = Store.load('dayos');
    const list     = document.getElementById('priorities-list');
    const empty    = document.getElementById('priorities-empty');
    const counter  = document.getElementById('priorities-counter');
    const addBtn   = document.getElementById('btn-add-priority');
    if (!list) return;

    const priorities = data.priorities.filter(p => p.text?.trim());
    const doneCount  = priorities.filter(p => p.done).length;
    const total      = priorities.length;

    // Contador y badge
    if (counter) counter.textContent = `${doneCount}/${total}`;
    const sp = document.getElementById('stat-priorities');
    if (sp) sp.textContent = `${doneCount}/${total}`;

    if (addBtn) addBtn.style.opacity = '1';

    list.innerHTML = '';

    if (!priorities.length) {
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    priorities.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'card-in';
      row.style.cssText = `
        display:flex; align-items:center; gap:12px;
        padding:14px 16px; border-radius:var(--r-lg);
        background:${p.done ? 'rgba(26,92,69,0.04)' : 'rgba(255,253,248,0.65)'};
        border:0.5px solid ${p.done ? 'rgba(26,92,69,0.12)' : 'rgba(255,255,255,0.70)'};
        box-shadow:0 1px 0 rgba(255,255,255,0.80) inset, 0 2px 6px rgba(20,16,10,0.04);
        transition:all var(--t-base); opacity:${p.done ? '0.68' : '1'};
      `;

      row.innerHTML = `
        <div style="
          font-family:var(--font-mono); font-size:var(--text-xs); font-weight:500;
          color:${p.done ? 'var(--text-5)' : 'var(--gold-3)'}; width:18px; text-align:center; flex-shrink:0;
        ">${i + 1}</div>
        <button class="priority-check" style="
          ${p.done
            ? 'background:linear-gradient(135deg,var(--emerald),var(--emerald-3));border-color:var(--emerald-2);color:#fff;'
            : ''}
        ">${p.done ? '✓' : ''}</button>
        <span style="
          flex:1; font-size:var(--text-base); line-height:1.45;
          color:${p.done ? 'var(--text-4)' : 'var(--text-2)'};
          text-decoration:${p.done ? 'line-through' : 'none'};
          cursor:pointer;
        " class="pri-text">${p.text}</span>
        <div class="flex gap-1" style="flex-shrink:0;">
          <button class="btn-kc pri-edit" title="Editar">✎</button>
          <button class="btn-kc btn-kc-del pri-del" title="Eliminar">×</button>
        </div>
      `;

      // Toggle completado
      row.querySelector('.priority-check').addEventListener('click', () => {
        Store.update('dayos', d => {
          const pr = d.priorities.find(x => x.id === p.id);
          if (pr) pr.done = !pr.done;
          return d;
        });
        renderPriorities();
        updateSidebarCounts();
      });

      // Editar al click en el texto o botón editar
      const editFn = () => openEditPriorityModal(p);
      row.querySelector('.pri-text').addEventListener('click', editFn);
      row.querySelector('.pri-edit').addEventListener('click', editFn);

      // Eliminar
      row.querySelector('.pri-del').addEventListener('click', () => {
        Store.update('dayos', d => {
          d.priorities = d.priorities.filter(x => x.id !== p.id);
          return d;
        });
        renderPriorities();
        updateSidebarCounts();
        Toast.show('Prioridad eliminada', 'info');
      });

      list.appendChild(row);
    });

  }

  function openAddPriorityModal() {
    Modal.open({
      title: 'Nueva prioridad',
      body: `
        <div class="flex flex-col gap-3">
          <div>
            <label class="form-label">¿Cuál es tu prioridad?</label>
            <textarea id="m-pri-text" class="input-glass textarea-glass w-full"
              placeholder="La tarea que más mueve la aguja hoy…"
              style="min-height:90px;font-size:var(--text-base);line-height:1.55;resize:none;"></textarea>
          </div>
        </div>
      `,
      confirmLabel: '+ Agregar prioridad',
      onConfirm: () => {
        const text = document.getElementById('m-pri-text')?.value?.trim();
        if (!text) { Toast.show('Escribe la prioridad primero', 'warning'); return false; }

        Store.update('dayos', d => {
          d.priorities.push({ id: Store.uid(), text, done: false });
          return d;
        });

        renderPriorities();
        updateSidebarCounts();
        Toast.show('Prioridad agregada ✓');
      }
    });
  }

  function openEditPriorityModal(p) {
    Modal.open({
      title: 'Editar prioridad',
      body: `
        <div class="flex flex-col gap-3">
          <div>
            <label class="form-label">Prioridad</label>
            <textarea id="m-pri-edit-text" class="input-glass textarea-glass w-full"
              style="min-height:90px;font-size:var(--text-base);line-height:1.55;resize:none;">${p.text}</textarea>
          </div>
          ${p.done ? '<p style="font-size:var(--text-xs);color:var(--emerald-2);">✓ Esta prioridad ya está completada</p>' : ''}
        </div>
      `,
      confirmLabel: 'Guardar cambios',
      onConfirm: () => {
        const text = document.getElementById('m-pri-edit-text')?.value?.trim();
        if (!text) { Toast.show('El texto no puede estar vacío', 'warning'); return false; }

        Store.update('dayos', d => {
          const pr = d.priorities.find(x => x.id === p.id);
          if (pr) pr.text = text;
          return d;
        });

        renderPriorities();
        Toast.show('Prioridad actualizada ✓');
      }
    });
  }

  /* ════════════════════════════════════════════════════════
     DAYOS — KANBAN
     ════════════════════════════════════════════════════════ */
  function initKanban() {
    renderKanban();

    // Botón + Nueva tarea
    document.getElementById('btn-kanban-add')?.addEventListener('click', () => {
      openAddTaskModal();
    });
  }

  function renderKanban() {
    const data  = Store.load('dayos');
    const total = (data.kanban.todo?.length || 0) + (data.kanban.doing?.length || 0) + (data.kanban.done?.length || 0);
    const done  = data.kanban.done?.length || 0;
    const sub   = document.getElementById('board-subtitle');
    if (sub) sub.textContent = total ? `${done} de ${total} completadas` : 'Sin tareas aún';

    const cols = {
      todo:  { el: document.getElementById('kanban-todo'),  items: data.kanban.todo },
      doing: { el: document.getElementById('kanban-doing'), items: data.kanban.doing },
      done:  { el: document.getElementById('kanban-done'),  items: data.kanban.done }
    };

    Object.entries(cols).forEach(([col, { el, items }]) => {
      if (!el) return;
      el.innerHTML = '';

      // Actualizar contador en header
      const countEl = document.querySelector(`[data-col-count="${col}"]`);
      if (countEl) countEl.textContent = items.length;

      // Empty state por columna
      if (!items.length) {
        const emptyMsgs = {
          todo:  ['Sin tareas pendientes', 'Agrega una con + Tarea'],
          doing: ['Nada en progreso', 'Mueve una tarea de "Por hacer"'],
          done:  ['Aún sin completar', 'Completa tu primera tarea hoy']
        };
        const [line1, line2] = emptyMsgs[col] || ['Vacío', ''];
        const emp = document.createElement('div');
        emp.style.cssText = 'padding:var(--sp-6) var(--sp-4);text-align:center;';
        emp.innerHTML = `
          <p style="font-size:var(--text-sm);color:var(--text-5);margin-bottom:3px;">${line1}</p>
          <p style="font-size:var(--text-xs);color:var(--text-5);opacity:0.7;">${line2}</p>
        `;
        el.appendChild(emp);
      }

      items.forEach(task => {
        const card = document.createElement('div');
        card.className = 'kanban-card card-in';
        card.dataset.id  = task.id;
        card.dataset.col = col;

        card.innerHTML = buildKanbanCard(task, col);
        el.appendChild(card);

        // Acciones en la card
        card.querySelector('.kc-move')?.addEventListener('click', e => {
          e.stopPropagation();
          moveKanbanTask(task.id, col);
        });

        card.querySelector('.kc-delete')?.addEventListener('click', e => {
          e.stopPropagation();
          deleteKanbanTask(task.id, col);
        });

        // Editar progress en "doing"
        const progInput = card.querySelector('.kc-progress-input');
        if (progInput) {
          progInput.addEventListener('change', () => {
            const val = parseInt(progInput.value, 10);
            Store.update('dayos', d => {
              const t = d.kanban.doing.find(t => t.id === task.id);
              if (t) t.progress = val;
              return d;
            });
            card.querySelector('.kc-progress-fill').style.width = val + '%';
            card.querySelector('.kc-progress-badge').textContent = val + '%';
          });
        }
      });
    });
  }

  function buildKanbanCard(task, col) {
    const BADGE_COLORS = { gold:'gold', sky:'sky', emerald:'emerald', sunset:'sunset', neutral:'neutral', Media:'neutral', Alta:'gold', Personal:'sky', Foco:'emerald' };
    const badgeColor   = BADGE_COLORS[task.badge] || 'neutral';
    const nextLabel    = { todo:'→ En progreso', doing:'→ Completar', done:'↩ Reabrir' };

    if (col === 'done') {
      return `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <p style="font-size:var(--text-sm);color:var(--text-4);text-decoration:line-through;line-height:1.35;flex:1;">${task.title}</p>
          <div class="kc-actions">
            <button class="kc-move btn-kc" title="${nextLabel[col]}">↩</button>
            <button class="kc-delete btn-kc btn-kc-del" title="Eliminar">×</button>
          </div>
        </div>
        <span class="badge badge-emerald" style="margin-top:6px;display:inline-flex;">✓ ${task.doneAt || 'Listo'}</span>
      `;
    }

    if (col === 'doing') {
      return `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <p style="font-size:var(--text-sm);font-weight:500;color:var(--text-2);line-height:1.35;flex:1;">${task.title}</p>
          <div class="kc-actions">
            <button class="kc-move btn-kc" title="${nextLabel[col]}">✓</button>
            <button class="kc-delete btn-kc btn-kc-del" title="Eliminar">×</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
          <div class="prog-track" style="flex:1;">
            <div class="prog-fill prog-gold kc-progress-fill" style="width:${task.progress||0}%;"></div>
          </div>
          <span class="badge badge-gold kc-progress-badge">${task.progress||0}%</span>
        </div>
        <input type="range" class="kc-progress-input" min="0" max="100" value="${task.progress||0}"
               style="width:100%;margin-top:6px;accent-color:var(--gold);cursor:pointer;" />
        ${task.badge ? badgeHTML(badgeColor, task.badge) : ''}
      `;
    }

    // todo
    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <p style="font-size:var(--text-sm);font-weight:500;color:var(--text-2);line-height:1.35;flex:1;">${task.title}</p>
        <div class="kc-actions">
          <button class="kc-move btn-kc" title="${nextLabel[col]}">→</button>
          <button class="kc-delete btn-kc btn-kc-del" title="Eliminar">×</button>
        </div>
      </div>
      ${task.badge ? `<div style="margin-top:8px;">${badgeHTML(badgeColor, task.badge)}</div>` : ''}
    `;
  }

  function openAddTaskModal() {
    Modal.open({
      title: 'Nueva tarea',
      body: `
        <div class="flex flex-col gap-3">
          <div>
            <label class="form-label">Título de la tarea</label>
            <input id="m-task-title" class="input-glass w-full" type="text" placeholder="¿Qué hay que hacer?"/>
          </div>
          <div>
            <label class="form-label">Columna</label>
            <select id="m-task-col" class="input-glass w-full">
              <option value="todo">Por hacer</option>
              <option value="doing">En progreso</option>
            </select>
          </div>
          <div>
            <label class="form-label">Etiqueta</label>
            <select id="m-task-badge" class="input-glass w-full">
              <option value="Alta">Alta prioridad</option>
              <option value="Media">Media prioridad</option>
              <option value="Personal">Personal</option>
              <option value="Foco">Foco</option>
              <option value="">Sin etiqueta</option>
            </select>
          </div>
          ${buildProgressField()}
        </div>
      `,
      confirmLabel: '+ Agregar tarea',
      onConfirm: () => {
        const title = document.getElementById('m-task-title')?.value?.trim();
        if (!title) { Toast.show('Escribe el título de la tarea', 'warning'); return false; }
        const col     = document.getElementById('m-task-col')?.value || 'todo';
        const badge   = document.getElementById('m-task-badge')?.value || '';
        const prog    = parseInt(document.getElementById('m-task-progress')?.value || '0', 10);

        Store.update('dayos', d => {
          const task = { id: Store.uid(), title, badge, color: 'neutral', createdAt: Date.now() };
          if (col === 'doing') task.progress = prog;
          d.kanban[col].unshift(task);
          return d;
        });

        renderKanban();
        Toast.show('Tarea agregada');
      }
    });
  }

  function buildProgressField() {
    return `
      <div id="m-progress-wrap" style="display:none;">
        <label class="form-label">Progreso inicial (%)</label>
        <input id="m-task-progress" type="range" min="0" max="100" value="0"
               style="width:100%;accent-color:var(--gold);" />
      </div>
    `;
  }

  function moveKanbanTask(id, fromCol) {
    const NEXT = { todo:'doing', doing:'done', done:'todo' };
    const toCol = NEXT[fromCol];
    const now   = new Date().toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' });

    Store.update('dayos', d => {
      const idx  = d.kanban[fromCol].findIndex(t => t.id === id);
      if (idx < 0) return d;
      const [task] = d.kanban[fromCol].splice(idx, 1);
      if (toCol === 'done') task.doneAt = now;
      d.kanban[toCol].unshift(task);
      return d;
    });

    renderKanban();
    const labels = { todo:'Por hacer', doing:'En progreso', done:'Completado' };
    Toast.show(`Tarea movida a "${labels[toCol]}"`);
  }

  function deleteKanbanTask(id, col) {
    Store.update('dayos', d => {
      d.kanban[col] = d.kanban[col].filter(t => t.id !== id);
      return d;
    });
    renderKanban();
    Toast.show('Tarea eliminada', 'info');
  }

  /* ════════════════════════════════════════════════════════
     DAYOS — POMODORO
     ════════════════════════════════════════════════════════ */
  const TOTAL_WORK  = 25 * 60;
  const TOTAL_BREAK = 5  * 60;
  const CIRCUM      = 2 * Math.PI * 90;

  let pomSecs    = TOTAL_WORK;
  let pomRunning = false;
  let pomMode    = 'work';
  let pomInterval= null;

  function fmtTime(s) {
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  function renderPomodoro() {
    const disp = document.getElementById('timer-display');
    const mode = document.getElementById('timer-mode');
    const ring = document.getElementById('timer-ring-fill');

    if (disp) { disp.textContent = fmtTime(pomSecs); disp.style.color = pomMode === 'work' ? 'var(--gold)' : 'var(--emerald-2)'; }
    if (mode) mode.textContent   = pomMode === 'work' ? 'TRABAJO' : 'DESCANSO';
    if (ring) {
      const total    = pomMode === 'work' ? TOTAL_WORK : TOTAL_BREAK;
      const progress = 1 - pomSecs / total;
      ring.style.strokeDashoffset = CIRCUM * (1 - progress);
    }
  }

  function renderSessionDots() {
    const data = Store.load('dayos');
    const sess = data.pomodoro.sessionsToday;
    const tgt  = data.pomodoro.targetSessions;
    const wrap = document.getElementById('session-dots');
    if (!wrap) return;

    wrap.innerHTML = '';
    for (let i = 0; i < tgt; i++) {
      const d = document.createElement('div');
      d.className = `session-dot ${i < sess ? 'done' : i === sess ? 'current' : 'empty'}`;
      wrap.appendChild(d);
    }

    const statEl = document.getElementById('stat-pomodoros');
    if (statEl) statEl.textContent = sess;
  }

  function pomTick() {
    if (pomSecs <= 0) {
      clearInterval(pomInterval);
      pomRunning = false;
      const btn  = document.getElementById('timer-btn');
      if (btn) btn.textContent = '▶ Iniciar';

      if (pomMode === 'work') {
        // Completó una sesión de trabajo
        Store.update('dayos', d => {
          d.pomodoro.sessionsToday = Math.min((d.pomodoro.sessionsToday || 0) + 1, d.pomodoro.targetSessions);
          return d;
        });
        renderSessionDots();
        Toast.show('🍅 ¡Sesión completada! Tómate un descanso de 5 min', 'success', 5000);
        pomMode = 'break';
        pomSecs = TOTAL_BREAK;
      } else {
        Toast.show('⚡ Descanso terminado. ¡A trabajar!', 'info', 4000);
        pomMode = 'work';
        pomSecs = TOTAL_WORK;
      }
      renderPomodoro();
      return;
    }
    pomSecs--;
    renderPomodoro();
  }

  function startPomodoro() {
    if (pomRunning) return;
    pomInterval = setInterval(pomTick, 1000);
    pomRunning  = true;
    const btn   = document.getElementById('timer-btn');
    if (btn) btn.textContent = '⏸ Pausar';
  }

  function initPomodoro() {
    renderPomodoro();
    renderSessionDots();

    document.getElementById('timer-btn')?.addEventListener('click', () => {
      if (pomRunning) {
        clearInterval(pomInterval);
        pomRunning = false;
        document.getElementById('timer-btn').textContent = '▶ Continuar';
      } else {
        startPomodoro();
      }
    });

    document.getElementById('timer-reset')?.addEventListener('click', () => {
      clearInterval(pomInterval);
      pomRunning = false;
      pomMode    = 'work';
      pomSecs    = TOTAL_WORK;
      document.getElementById('timer-btn').textContent = '▶ Iniciar';
      renderPomodoro();
      Toast.show('Timer reiniciado', 'info');
    });
  }

  /* ════════════════════════════════════════════════════════
     DAYOS — AGENDA MULTI-DÍA
     ════════════════════════════════════════════════════════ */
  let agendaSelectedDate = Store.today();

  const AGENDA_COLORS = [
    { label:'Foco · Trabajo profundo', value:'var(--emerald-2)', badge:'emerald', badgeLabel:'Foco' },
    { label:'Reunión',                 value:'var(--sunset-2)',  badge:'sunset',  badgeLabel:'Reunión' },
    { label:'Trabajo',                 value:'var(--gold)',      badge:'gold',    badgeLabel:'Trabajo' },
    { label:'Call',                    value:'var(--sky-2)',     badge:'sky',     badgeLabel:'Call' },
    { label:'Pausa / Personal',        value:'rgba(20,16,10,0.10)', badge:'neutral', badgeLabel:'Pausa' },
  ];

  function initAgenda() {
    renderWeekTabs();
    renderAgendaBlocks(agendaSelectedDate);
    updateAgendaSubtitle();
    updateNextEventStat();

    document.getElementById('agenda-prev-week')?.addEventListener('click', () => navigateAgendaWeek(-7));
    document.getElementById('agenda-next-week')?.addEventListener('click', () => navigateAgendaWeek(7));
    document.getElementById('agenda-today-btn')?.addEventListener('click', () => {
      agendaSelectedDate = Store.today();
      renderWeekTabs();
      renderAgendaBlocks(agendaSelectedDate);
      updateAgendaSubtitle();
    });
    document.getElementById('btn-add-block')?.addEventListener('click', openAddBlockModal);
  }

  function navigateAgendaWeek(days) {
    const d = new Date(agendaSelectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    agendaSelectedDate = d.toISOString().slice(0, 10);
    renderWeekTabs();
    renderAgendaBlocks(agendaSelectedDate);
    updateAgendaSubtitle();
  }

  function renderWeekTabs() {
    const tabsEl    = document.getElementById('agenda-tabs');
    const rangeEl   = document.getElementById('agenda-week-range');
    const todayBtn  = document.getElementById('agenda-today-btn');
    if (!tabsEl) return;

    const today  = Store.today();
    const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

    // Lunes de la semana que contiene la fecha seleccionada
    const base   = new Date(agendaSelectedDate + 'T12:00:00');
    const dow    = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Rango de semana en header
    if (rangeEl) {
      const m1 = monday.getMonth(), m2 = sunday.getMonth();
      rangeEl.textContent = m1 === m2
        ? `${monday.getDate()}–${sunday.getDate()} ${MONTHS[m1]}`
        : `${monday.getDate()} ${MONTHS[m1]} – ${sunday.getDate()} ${MONTHS[m2]}`;
    }

    // Botón Hoy: resaltado si estamos en la semana de hoy
    if (todayBtn) {
      const todayDate = new Date(today + 'T12:00:00');
      const inCurrentWeek = todayDate >= monday && todayDate <= sunday;
      todayBtn.style.opacity = inCurrentWeek && agendaSelectedDate === today ? '0.4' : '1';
    }

    tabsEl.innerHTML = '';

    const agendaData = (Store.load('dayos').agenda) || {};

    for (let i = 0; i < 7; i++) {
      const d   = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = d.toISOString().slice(0, 10);

      const hasBlocks = (agendaData[key] || []).length > 0;
      const isToday   = key === today;
      const isSel     = key === agendaSelectedDate;

      const tab = document.createElement('button');
      tab.className = 'agenda-day-tab' + (isSel ? ' selected' : '') + (isToday ? ' is-today' : '');
      tab.innerHTML = `
        <span class="agenda-tab-name">${DAYS[d.getDay()]}</span>
        <span class="agenda-tab-num">${d.getDate()}</span>
        <span class="agenda-tab-dot" style="opacity:${hasBlocks ? 1 : 0};"></span>
      `;
      tab.addEventListener('click', () => {
        agendaSelectedDate = key;
        renderWeekTabs();
        renderAgendaBlocks(key);
        updateAgendaSubtitle();
      });
      tabsEl.appendChild(tab);
    }
  }

  function updateAgendaSubtitle() {
    const sub = document.getElementById('agenda-date-sub');
    if (!sub) return;
    const d      = new Date(agendaSelectedDate + 'T12:00:00');
    const today  = Store.today();
    const DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    if (agendaSelectedDate === today) {
      sub.textContent = `Hoy · ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
    } else {
      sub.textContent = `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
    }
  }

  function getAgendaBlocksForDate(dateKey) {
    const data = Store.load('dayos');
    return ((data.agenda || {})[dateKey] || []);
  }

  function renderAgendaBlocks(dateKey) {
    const list = document.getElementById('agenda-list');
    if (!list) return;

    const blocks = getAgendaBlocksForDate(dateKey);
    list.innerHTML = '';

    if (!blocks.length) {
      list.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:var(--sp-10) var(--sp-4);">
          <p style="font-size:var(--text-base);color:var(--text-4);margin-bottom:6px;">Sin bloques para este día</p>
          <p style="font-size:var(--text-sm);color:var(--text-5);">Usa "+ Bloque" para planificar tu tiempo</p>
        </div>
      `;
      return;
    }

    // Calcular el próximo bloque para hoy
    const isToday  = dateKey === Store.today();
    const nowMin   = new Date().getHours() * 60 + new Date().getMinutes();
    let   nextId   = null;
    if (isToday) {
      const upcoming = blocks
        .map(b => ({ ...b, min: parseInt(b.from.split(':')[0]) * 60 + parseInt(b.from.split(':')[1] || 0) }))
        .filter(b => b.min > nowMin)
        .sort((a, b) => a.min - b.min);
      if (upcoming.length) nextId = upcoming[0].id;
    }

    blocks.forEach(block => {
      const [bh, bm] = block.from.split(':');
      const blockMin = parseInt(bh) * 60 + parseInt(bm || 0);
      const isPast   = isToday && blockMin + 60 < nowMin;
      const isNext   = block.id === nextId;

      const el = document.createElement('div');
      el.className = 'time-block card-in';
      if (isPast) el.style.opacity = '0.45';
      if (isNext)  el.style.cssText += 'border-color:rgba(200,168,75,0.30)!important;box-shadow:0 1px 0 rgba(255,255,255,0.90) inset,0 2px 12px rgba(200,168,75,0.12)!important;';

      el.innerHTML = `
        <div class="time-block-accent" style="background:${block.color};"></div>
        <div class="time-block-body">
          <div class="time-block-time">${block.from} – ${block.to}${isNext ? ' <span style="font-size:9px;font-weight:700;color:var(--gold-3);letter-spacing:0.06em;text-transform:uppercase;margin-left:6px;">próximo</span>' : ''}</div>
          <div class="time-block-title">${block.title}</div>
          ${block.tag ? `<div class="time-block-tag">${block.tag}</div>` : ''}
        </div>
        <div style="padding:10px 14px;display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="badge badge-${block.badge}">${block.badgeLabel}</span>
          <button class="btn-kc btn-kc-del del-block" title="Eliminar">×</button>
        </div>
      `;

      el.querySelector('.del-block')?.addEventListener('click', e => {
        e.stopPropagation();
        Store.update('dayos', d => {
          if (!d.agenda) d.agenda = {};
          d.agenda[dateKey] = (d.agenda[dateKey] || []).filter(b => b.id !== block.id);
          return d;
        });
        renderAgendaBlocks(dateKey);
        renderWeekTabs();
        if (dateKey === Store.today()) updateNextEventStat();
      });

      list.appendChild(el);
    });
  }

  function openAddBlockModal() {
    const colorOpts = AGENDA_COLORS.map(c =>
      `<option value="${c.value}" data-badge="${c.badge}" data-label="${c.badgeLabel}">${c.label}</option>`
    ).join('');

    Modal.open({
      title: 'Nuevo bloque de tiempo',
      body: `
        <div class="flex flex-col gap-3">
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Desde</label>
              <input id="m-block-from" class="input-glass w-full" type="time" value="09:00" />
            </div>
            <div>
              <label class="form-label">Hasta</label>
              <input id="m-block-to" class="input-glass w-full" type="time" value="10:00" />
            </div>
          </div>
          <div>
            <label class="form-label">Actividad</label>
            <input id="m-block-title" class="input-glass w-full" type="text" placeholder="¿Qué vas a hacer?" />
          </div>
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Tipo</label>
              <select id="m-block-color" class="input-glass w-full">${colorOpts}</select>
            </div>
            <div>
              <label class="form-label">Nota (opcional)</label>
              <input id="m-block-tag" class="input-glass w-full" type="text" placeholder="Sin interrupciones…" />
            </div>
          </div>
        </div>
      `,
      confirmLabel: '+ Agregar bloque',
      onConfirm: () => {
        const title = document.getElementById('m-block-title')?.value?.trim();
        if (!title) { Toast.show('Escribe la actividad', 'warning'); return false; }

        const from  = document.getElementById('m-block-from')?.value || '09:00';
        const to    = document.getElementById('m-block-to')?.value   || '10:00';
        const sel   = document.getElementById('m-block-color');
        const color = sel?.value || 'var(--gold)';
        const badge      = sel?.options[sel.selectedIndex]?.dataset.badge || 'gold';
        const badgeLabel = sel?.options[sel.selectedIndex]?.dataset.label || 'Trabajo';
        const tag   = document.getElementById('m-block-tag')?.value?.trim() || '';

        const block = { id: Store.uid(), from, to, title, color, badge, badgeLabel, tag };

        Store.update('dayos', d => {
          if (!d.agenda) d.agenda = {};
          if (!d.agenda[agendaSelectedDate]) d.agenda[agendaSelectedDate] = [];
          d.agenda[agendaSelectedDate].push(block);
          d.agenda[agendaSelectedDate].sort((a, b) => a.from.localeCompare(b.from));
          return d;
        });

        renderAgendaBlocks(agendaSelectedDate);
        renderWeekTabs();
        if (agendaSelectedDate === Store.today()) updateNextEventStat();
        Toast.show('Bloque agregado ✓');
      }
    });
  }

  function updateNextEventStat() {
    const today  = Store.today();
    const blocks = getAgendaBlocksForDate(today);
    const now    = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const upcoming = blocks
      .map(b => {
        const [h, m] = b.from.split(':');
        return { ...b, startMin: parseInt(h) * 60 + parseInt(m || 0) };
      })
      .filter(b => b.startMin > nowMin)
      .sort((a, b) => a.startMin - b.startMin);

    const statEl  = document.getElementById('stat-next-event');
    const labelEl = document.getElementById('stat-next-label');
    if (!statEl) return;

    if (!upcoming.length) {
      statEl.textContent = '—';
      if (labelEl) labelEl.textContent = 'Próximo evento';
      return;
    }

    const next     = upcoming[0];
    const minsAway = next.startMin - nowMin;
    statEl.textContent = next.from;
    if (labelEl) {
      labelEl.textContent = minsAway < 60
        ? `En ${minsAway} min · ${next.title.slice(0, 22)}`
        : next.title.slice(0, 30);
    }
  }

  /* ════════════════════════════════════════════════════════
     DAYOS — REFLEXIÓN DEL DÍA
     ════════════════════════════════════════════════════════ */
  function initReflection() {
    const todayKey = Store.today();
    const data     = Store.load('dayos');
    const ref      = data.reflection?.[todayKey];

    // Badge con la fecha de hoy
    const badge = document.getElementById('ref-today-badge');
    if (badge) {
      const n = new Date();
      const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      badge.textContent = `${DAYS[n.getDay()]} ${n.getDate()} ${MONTHS[n.getMonth()]}`;
    }

    const fields = ['q1','q2','q3','q4','q5'];

    const saveBtn = document.getElementById('btn-save-reflection');

    const btn = document.getElementById('btn-save-reflection');
    btn?.addEventListener('click', () => {
      const entry = {};
      fields.forEach(f => {
        entry[f] = document.getElementById(`ref-${f}`)?.value?.trim() || '';
      });

      Store.update('dayos', d => {
        if (!d.reflection) d.reflection = {};
        d.reflection[todayKey] = { ...entry, savedAt: Date.now() };
        return d;
      });

      // Limpiar campos
      fields.forEach(f => {
        const el = document.getElementById(`ref-${f}`);
        if (el) el.value = '';
      });

      // Feedback visual en el botón
      if (btn) {
        btn.innerHTML = '✓ Guardada';
        btn.disabled = true;
        setTimeout(() => {
          btn.innerHTML = '✦ Guardar reflexión del día';
          btn.disabled = false;
        }, 2000);
      }

      Toast.show('Reflexión del día guardada ✓', 'success');
      renderReflectionHistory();
    });

    renderReflectionHistory();
  }

  const QS_LABELS = [
    ['I',   'Logro principal',      'ref-q1'],
    ['II',  'Aprendizaje clave',    'ref-q2'],
    ['III', '¿Qué haría diferente?','ref-q3'],
    ['IV',  'Energía para mañana',  'ref-q4'],
    ['V',   'Gratitud del día',     'ref-q5'],
  ];

  function renderReflectionHistory() {
    const data      = Store.load('dayos');
    const history   = data.reflection || {};
    const container = document.getElementById('reflection-history');
    const countEl   = document.getElementById('ref-count');
    const todayKey  = Store.today();

    if (!container) return;

    const entries = Object.entries(history).sort(([a], [b]) => b.localeCompare(a));

    if (countEl) {
      countEl.textContent = entries.length === 0
        ? 'Sin entradas aún'
        : `${entries.length} entrada${entries.length === 1 ? '' : 's'}`;
    }

    container.innerHTML = '';
    if (entries.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:var(--text-4);font-size:var(--text-sm);padding:var(--sp-6) 0;">Aún no hay reflexiones guardadas</p>`;
      return;
    }

    entries.forEach(([dateKey, ref]) => {
      const isToday = dateKey === todayKey;
      const date    = new Date(dateKey + 'T12:00:00');
      const DAYS    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      const MONTHS  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      const dateStr = isToday ? 'Hoy' : `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

      const el = document.createElement('div');
      el.className = 'card card-sm';
      el.style.cssText = `border-color:${isToday ? 'rgba(200,168,75,0.35)' : ''};`;

      el.innerHTML = `
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3" style="cursor:pointer;flex:1;min-width:0;" data-open>
            <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:${isToday ? 'var(--gold-3)' : 'var(--text-4)'};letter-spacing:0.04em;font-weight:${isToday ? 600 : 400};white-space:nowrap;">${dateStr}</span>
            ${ref.q1 ? `<span style="font-size:var(--text-sm);color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ref.q1}</span>` : '<span style="font-size:var(--text-sm);color:var(--text-5);font-style:italic;">Sin logro registrado</span>'}
          </div>
          <div class="flex items-center gap-2" style="flex-shrink:0;margin-left:var(--sp-3);">
            <button class="btn btn-glass btn-sm ref-btn-edit" style="font-size:11px;padding:3px 10px;">Editar</button>
            <button class="btn btn-sm ref-btn-delete" style="font-size:11px;padding:3px 10px;background:rgba(217,110,50,0.08);border-color:rgba(217,110,50,0.20);color:var(--sunset);">×</button>
          </div>
        </div>
      `;

      el.querySelector('[data-open]').addEventListener('click', () => openReflectionDetail(dateStr, ref));
      el.querySelector('.ref-btn-edit').addEventListener('click', () => openReflectionEdit(dateKey, ref));
      el.querySelector('.ref-btn-delete').addEventListener('click', () => {
        Modal.open({
          title: 'Borrar reflexión',
          body: `<p style="color:var(--text-2);font-size:var(--text-sm);">¿Seguro que quieres borrar la reflexión del <strong>${dateStr}</strong>? Esta acción no se puede deshacer.</p>`,
          confirmLabel: 'Sí, borrar',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Store.update('dayos', d => {
              delete d.reflection[dateKey];
              return d;
            });
            renderReflectionHistory();
            updateAllStats();
            Toast.show('Reflexión eliminada', 'info');
          }
        });
      });

      container.appendChild(el);
    });
  }

  function openReflectionDetail(dateStr, ref) {
    const bodyHtml = QS_LABELS.map(([num, label], i) => {
      const val = ref[`q${i + 1}`];
      if (!val) return '';
      return `<div style="margin-bottom:var(--sp-4);">
        <p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold-3);margin-bottom:4px;">${num} — ${label}</p>
        <p style="font-size:var(--text-sm);color:var(--text-2);line-height:1.6;">${val}</p>
      </div>`;
    }).join('');

    Modal.open({
      title: `Reflexión · ${dateStr}`,
      body: `<div class="flex flex-col">${bodyHtml || '<p style="color:var(--text-4);">Sin contenido guardado.</p>'}</div>`,
      hideFooter: true
    });
  }

  function openReflectionEdit(dateKey, ref) {
    const date    = new Date(dateKey + 'T12:00:00');
    const DAYS    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const MONTHS  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const dateStr = dateKey === Store.today() ? 'Hoy' : `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

    const placeholders = [
      '¿Cuál fue tu victoria del día?',
      '¿Qué aprendiste hoy?',
      'Una mejora concreta para mañana…',
      '¿Cómo llega tu energía al próximo día?',
      'Tres cosas por las que estás agradecido…'
    ];

    const bodyHtml = QS_LABELS.map(([num, label, id], i) => `
      <div class="flex flex-col gap-1" style="margin-bottom:var(--sp-3);">
        <label class="label-upper" style="color:var(--gold-3);">${num} — ${label}</label>
        ${i < 3
          ? `<textarea id="edit-${id}" class="input-glass textarea-glass" style="min-height:64px;" placeholder="${placeholders[i]}">${ref[`q${i+1}`] || ''}</textarea>`
          : `<input id="edit-${id}" class="input-glass" type="text" placeholder="${placeholders[i]}" value="${ref[`q${i+1}`] || ''}" />`
        }
      </div>
    `).join('');

    Modal.open({
      title: `Editar reflexión · ${dateStr}`,
      body: `<div class="flex flex-col">${bodyHtml}</div>`,
      confirmText: 'Guardar cambios',
      onConfirm: () => {
        const updated = { savedAt: ref.savedAt };
        QS_LABELS.forEach(([,, id], i) => {
          updated[`q${i+1}`] = document.getElementById(`edit-${id}`)?.value?.trim() || '';
        });
        Store.update('dayos', d => {
          d.reflection[dateKey] = updated;
          return d;
        });
        renderReflectionHistory();
        Toast.show('Reflexión actualizada ✓');
      }
    });
  }

  /* ════════════════════════════════════════════════════════
     TOGGLES GLOBALES
     ════════════════════════════════════════════════════════ */
  function initToggles() {
    document.querySelectorAll('.toggle-wrap').forEach(wrap => {
      const t = wrap.querySelector('.toggle');
      if (t) wrap.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  /* ════════════════════════════════════════════════════════
     WEALTHOS
     ════════════════════════════════════════════════════════ */
  const ASSET_TYPE_COLORS = {
    'Renta Variable': '#C8A84B',
    'Renta Fija':     '#2E7D5E',
    'Inmobiliario':   '#D96E32',
    'Crypto':         '#3470B8',
    'Commodity':      '#9B7653',
    'Efectivo':       '#7A8C9E',
  };

  function refreshWealth() {
    renderWealthKPIs();
    renderAssets();
    renderPortfolioDonut();
    renderCashFlow();
  }

  function initWealth() {
    // Dynamic hero period
    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const n = new Date();
    const periodEl = document.getElementById('wealth-hero-period');
    if (periodEl) periodEl.textContent = `Resumen · ${MONTHS[n.getMonth()]} ${n.getFullYear()}`;

    refreshWealth();

    document.getElementById('edit-monthly-income')?.addEventListener('click', () => openEditKPI('monthly-income'));
    document.getElementById('edit-monthly-expense')?.addEventListener('click', () => openEditKPI('monthly-expense'));

    document.getElementById('btn-add-asset')?.addEventListener('click', () => {
      const typeOptions = Object.keys(ASSET_TYPE_COLORS).map(t => `<option>${t}</option>`).join('');
      Modal.open({
        title: 'Agregar activo',
        body: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="form-label">Nombre del activo</label>
              <input id="m-asset-name" class="input-glass w-full" type="text" placeholder="ej. Apple Inc. (AAPL)" />
            </div>
            <div class="g2" style="gap:var(--sp-3);">
              <div>
                <label class="form-label">Tipo</label>
                <select id="m-asset-type" class="input-glass w-full">${typeOptions}</select>
              </div>
              <div>
                <label class="form-label">Emoji</label>
                <input id="m-asset-emoji" class="input-glass w-full" type="text" maxlength="2" value="💼" />
              </div>
            </div>
            <div class="g2" style="gap:var(--sp-3);">
              <div>
                <label class="form-label">Valor (USD)</label>
                <input id="m-asset-value" class="input-glass w-full" type="number" placeholder="0" min="0" />
              </div>
              <div>
                <label class="form-label">Cambio YTD (%)</label>
                <input id="m-asset-change" class="input-glass w-full" type="number" placeholder="0.0" step="0.1" />
              </div>
            </div>
          </div>
        `,
        confirmLabel: '+ Agregar activo',
        onConfirm: () => {
          const name  = document.getElementById('m-asset-name')?.value?.trim();
          const value = parseFloat(document.getElementById('m-asset-value')?.value || 0);
          if (!name)       { Toast.show('Escribe el nombre del activo', 'warning'); return false; }
          if (value <= 0)  { Toast.show('Ingresa un valor válido', 'warning'); return false; }

          Store.update('wealthos', d => {
            d.assets.push({
              id:     Store.uid(),
              name,
              type:   document.getElementById('m-asset-type')?.value || 'Renta Variable',
              value,
              change: parseFloat(document.getElementById('m-asset-change')?.value || 0),
              emoji:  document.getElementById('m-asset-emoji')?.value || '💼',
            });
            return d;
          });
          refreshWealth();
          Toast.show('Activo agregado ✓');
        }
      });
    });
  }

  function renderAssets() {
    const list = document.getElementById('assets-list');
    if (!list) return;
    const data  = Store.load('wealthos');
    const total = data.assets.reduce((s, a) => s + a.value, 0);
    list.innerHTML = '';

    if (!data.assets.length) {
      list.innerHTML = `<p style="text-align:center;color:var(--text-4);font-size:var(--text-sm);padding:var(--sp-5) 0;">Sin activos todavía. Agrega el primero →</p>`;
      return;
    }

    data.assets.forEach(asset => {
      const pct      = total > 0 ? ((asset.value / total) * 100).toFixed(1) : 0;
      const isUp     = asset.change >= 0;
      const typeColor = ASSET_TYPE_COLORS[asset.type] || 'var(--text-4)';

      const row = document.createElement('div');
      row.className = 'asset-row';
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <div class="asset-icon" style="background:${typeColor}18;font-size:18px;">${asset.emoji}</div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:var(--text-sm);font-weight:500;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${asset.name}</p>
          <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
            <span style="font-size:9px;font-weight:600;letter-spacing:0.05em;padding:1px 6px;border-radius:4px;background:${typeColor}18;color:${typeColor};">${asset.type}</span>
            <span style="font-size:var(--text-xs);color:var(--text-4);">${pct}%</span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p class="font-serif" style="font-size:var(--text-lg);color:var(--text);">${fmt$(asset.value)}</p>
          <span class="kpi-change ${isUp ? 'up' : 'down'}" style="font-size:10px;">${isUp ? '↑' : '↓'} ${Math.abs(asset.change).toFixed(1)}% YTD</span>
        </div>
      `;

      row.addEventListener('click', () => openEditAsset(asset));
      list.appendChild(row);
    });
  }

  function renderWealthKPIs() {
    const data    = Store.load('wealthos');
    const total   = data.assets.reduce((s, a) => s + a.value, 0);
    const income  = data.monthlyIncome  || 0;
    const expense = data.monthlyExpense || 0;
    const net     = income - expense;
    const savings = income > 0 ? Math.round((net / income) * 100) : 0;

    // Totals
    const totalEl  = document.getElementById('wealth-total');
    const countEl  = document.getElementById('wealth-asset-count');
    if (totalEl) totalEl.textContent = fmt$(total);
    if (countEl) countEl.textContent = `${data.assets.length} activo${data.assets.length !== 1 ? 's' : ''} registrado${data.assets.length !== 1 ? 's' : ''}`;

    // KPIs
    const incomeEl  = document.getElementById('wealth-income');
    const expenseEl = document.getElementById('wealth-expense');
    const netEl     = document.getElementById('wealth-net');
    const savingsEl = document.getElementById('wealth-savings');
    if (incomeEl)  incomeEl.textContent  = fmt$(income);
    if (expenseEl) expenseEl.textContent = fmt$(expense);
    if (netEl) {
      netEl.textContent = fmt$(net);
      netEl.style.color = net >= 0 ? 'var(--emerald-2)' : 'var(--sunset)';
    }
    if (savingsEl) {
      savingsEl.textContent = savings + '%';
      savingsEl.style.color = savings >= 50 ? 'var(--gold)' : savings >= 30 ? 'var(--sunset-2)' : 'var(--sunset)';
    }

    // Bars
    const expPct = income > 0 ? Math.min((expense / income) * 100, 100) : 0;
    const netPct = income > 0 ? Math.max((net / income) * 100, 0) : 0;
    const expBar = document.getElementById('expense-bar');
    const netBar = document.getElementById('net-bar');
    const savBar = document.getElementById('savings-bar');
    if (expBar) expBar.style.width = expPct + '%';
    if (netBar) netBar.style.width = netPct + '%';
    if (savBar) savBar.style.width = Math.max(0, Math.min(savings, 100)) + '%';

    // Labels
    const expLabel = document.getElementById('expense-pct-label');
    const netLabel = document.getElementById('net-label');
    const savLabel = document.getElementById('savings-label');
    if (expLabel && income > 0) {
      expLabel.textContent = `${expPct.toFixed(0)}% del ingreso`;
      expLabel.className = `kpi-change ${expPct > 70 ? 'down' : 'flat'}`;
    }
    if (netLabel) {
      netLabel.textContent = net >= 0 ? `↑ ${fmt$(net)} guardado` : `↓ Déficit ${fmt$(Math.abs(net))}`;
      netLabel.className = `kpi-change ${net >= 0 ? 'up' : 'down'}`;
    }
    if (savLabel) {
      savLabel.textContent = savings >= 50 ? `✓ Por encima de la meta (≥50%)` : `Meta recomendada: ≥50%`;
      savLabel.className = `kpi-change ${savings >= 50 ? 'up' : 'flat'}`;
    }
  }

  function renderPortfolioDonut() {
    const data  = Store.load('wealthos');
    const total = data.assets.reduce((s, a) => s + a.value, 0);

    const donutEl  = document.getElementById('wealth-donut');
    const centerVal = document.getElementById('donut-center-val');
    const legend   = document.getElementById('portfolio-legend');
    if (!donutEl || !legend) return;

    if (centerVal) centerVal.textContent = fmt$(total);

    if (!data.assets.length || total === 0) {
      donutEl.style.background = 'conic-gradient(rgba(20,16,10,0.06) 0% 100%)';
      legend.innerHTML = `<p style="color:var(--text-4);font-size:var(--text-sm);">Agrega activos para ver la distribución</p>`;
      return;
    }

    // Agrupar por tipo
    const groups = {};
    data.assets.forEach(a => {
      groups[a.type] = (groups[a.type] || 0) + a.value;
    });

    const segments = Object.entries(groups)
      .map(([type, val]) => ({ type, val, pct: (val / total) * 100, color: ASSET_TYPE_COLORS[type] || '#8899AA' }))
      .sort((a, b) => b.val - a.val);

    // Conic gradient
    let cum = 0;
    const conic = segments.map(s => {
      const from = cum.toFixed(2);
      cum += s.pct;
      return `${s.color} ${from}% ${cum.toFixed(2)}%`;
    }).join(', ');
    donutEl.style.background = `conic-gradient(${conic})`;

    // Leyenda dinámica
    legend.innerHTML = segments.map(s => `
      <div class="flex items-center gap-3">
        <div style="width:10px;height:10px;border-radius:3px;background:${s.color};flex-shrink:0;"></div>
        <div style="flex:1;">
          <div class="flex justify-between" style="margin-bottom:3px;">
            <span style="font-size:var(--text-sm);color:var(--text-2);">${s.type}</span>
            <span style="font-size:var(--text-sm);font-weight:600;color:${s.color};">${s.pct.toFixed(1)}%</span>
          </div>
          <div class="prog-track" style="height:3px;">
            <div style="width:${s.pct.toFixed(1)}%;height:100%;border-radius:2px;background:${s.color};transition:width 0.6s ease;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderCashFlow() {
    const data    = Store.load('wealthos');
    const income  = data.monthlyIncome  || 0;
    const expense = data.monthlyExpense || 0;
    const net     = income - expense;
    const bars    = document.getElementById('cashflow-bars');
    if (!bars) return;

    const row = (label, value, widthPct, color, gradient = false) => `
      <div>
        <div class="flex justify-between" style="margin-bottom:6px;">
          <span style="font-size:var(--text-sm);color:var(--text-3);">${label}</span>
          <span style="font-size:var(--text-sm);font-weight:600;color:${color};">${fmt$(value)}</span>
        </div>
        <div class="prog-track" style="height:8px;border-radius:6px;">
          <div style="width:${Math.max(0, Math.min(widthPct, 100)).toFixed(1)}%;height:100%;border-radius:6px;transition:width 0.6s ease;${gradient ? `background:linear-gradient(90deg,${color}aa,${color});` : `background:${color};`}"></div>
        </div>
      </div>
    `;

    bars.innerHTML = `
      ${row('↑ Ingresos mensuales', income, 100, '#2E7D5E')}
      ${row('↓ Gastos mensuales',   expense, income > 0 ? (expense / income) * 100 : 0, '#D96E32')}
      <div style="border-top:0.5px solid rgba(20,16,10,0.07);padding-top:var(--sp-3);">
        ${row('= Ahorro neto', net, income > 0 ? Math.max(net / income * 100, 0) : 0, '#C8A84B', true)}
      </div>
    `;
  }

  function openEditKPI(field) {
    const data   = Store.load('wealthos');
    const labels = { 'monthly-income': 'Ingresos mensuales (USD)', 'monthly-expense': 'Gastos mensuales (USD)' };
    const keys   = { 'monthly-income': 'monthlyIncome', 'monthly-expense': 'monthlyExpense' };
    const key    = keys[field];

    Modal.open({
      title: `Editar: ${labels[field]}`,
      body: `
        <label class="form-label">${labels[field]}</label>
        <input id="m-kpi-val" class="input-glass w-full" type="number" value="${data[key] || 0}" min="0" step="100" />
      `,
      confirmLabel: 'Guardar',
      onConfirm: () => {
        const val = parseFloat(document.getElementById('m-kpi-val')?.value || 0);
        Store.update('wealthos', d => { d[key] = val; return d; });
        refreshWealth();
        Toast.show('Dato actualizado ✓');
      }
    });
  }

  function openEditAsset(asset) {
    const typeOptions = Object.keys(ASSET_TYPE_COLORS).map(t =>
      `<option ${t === asset.type ? 'selected' : ''}>${t}</option>`
    ).join('');

    Modal.open({
      title: 'Editar activo',
      body: `
        <div class="flex flex-col gap-3">
          <div>
            <label class="form-label">Nombre</label>
            <input id="m-ea-name" class="input-glass w-full" value="${asset.name}" />
          </div>
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Tipo</label>
              <select id="m-ea-type" class="input-glass w-full">${typeOptions}</select>
            </div>
            <div>
              <label class="form-label">Emoji</label>
              <input id="m-ea-emoji" class="input-glass w-full" value="${asset.emoji}" maxlength="2" />
            </div>
          </div>
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Valor (USD)</label>
              <input id="m-ea-value" class="input-glass w-full" type="number" value="${asset.value}" min="0" />
            </div>
            <div>
              <label class="form-label">Cambio YTD (%)</label>
              <input id="m-ea-change" class="input-glass w-full" type="number" step="0.1" value="${asset.change}" />
            </div>
          </div>
          <button id="m-ea-delete" class="btn btn-glass btn-sm" style="color:var(--sunset);margin-top:4px;">🗑 Eliminar activo</button>
        </div>
      `,
      confirmLabel: 'Guardar cambios',
      onConfirm: () => {
        const name  = document.getElementById('m-ea-name')?.value?.trim();
        const value = parseFloat(document.getElementById('m-ea-value')?.value || 0);
        if (!name)      { Toast.show('El nombre no puede estar vacío', 'warning'); return false; }
        if (value <= 0) { Toast.show('El valor debe ser mayor a 0', 'warning'); return false; }

        Store.update('wealthos', d => {
          const a = d.assets.find(x => x.id === asset.id);
          if (a) {
            a.name   = name;
            a.type   = document.getElementById('m-ea-type')?.value   || asset.type;
            a.emoji  = document.getElementById('m-ea-emoji')?.value  || asset.emoji;
            a.value  = value;
            a.change = parseFloat(document.getElementById('m-ea-change')?.value || 0);
          }
          return d;
        });
        refreshWealth();
        Toast.show('Activo actualizado ✓');
      }
    });

    setTimeout(() => {
      document.getElementById('m-ea-delete')?.addEventListener('click', () => {
        Modal.open({
          title: 'Eliminar activo',
          body: `<p style="color:var(--text-2);">¿Eliminar <strong>${asset.name}</strong>? Esta acción no se puede deshacer.</p>`,
          confirmLabel: 'Eliminar',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Store.update('wealthos', d => { d.assets = d.assets.filter(a => a.id !== asset.id); return d; });
            refreshWealth();
            Toast.show('Activo eliminado', 'info');
          }
        });
      });
    }, 50);
  }

  /* ════════════════════════════════════════════════════════
     PROJECTOS
     ════════════════════════════════════════════════════════ */
  const PROJ_COLORS = {
    gold:    { fill:'prog-gold',    badge:'badge-gold',    dot:'var(--gold)',     text:'var(--gold-3)'    },
    emerald: { fill:'prog-emerald', badge:'badge-emerald', dot:'var(--emerald-2)',text:'var(--emerald-2)' },
    sky:     { fill:'prog-sky',     badge:'badge-sky',     dot:'var(--sky)',      text:'var(--sky)'       },
    sunset:  { fill:'prog-sunset',  badge:'badge-sunset',  dot:'var(--sunset)',   text:'var(--sunset)'    },
    neutral: { fill:'prog-neutral', badge:'badge-neutral', dot:'var(--text-4)',   text:'var(--text-3)'    },
  };

  function refreshProjectos() {
    renderSprintKanban();
    renderProjects();
    renderMilestones();
    renderProjectKPIs();
  }

  function initProjectos() {
    refreshProjectos();

    const openTaskModal = () => {
      Modal.open({
        title: 'Nueva tarea',
        body: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="form-label">Título</label>
              <input id="m-pt-title" class="input-glass w-full" type="text" placeholder="¿Qué hay que hacer?" />
            </div>
            <div>
              <label class="form-label">Notas <span style="color:var(--text-4);font-weight:400;">(opcional)</span></label>
              <textarea id="m-pt-notes" class="input-glass textarea-glass w-full" placeholder="Contexto, links, detalles…" style="min-height:64px;"></textarea>
            </div>
            <div class="g2" style="gap:var(--sp-3);">
              <div>
                <label class="form-label">Story points</label>
                <select id="m-pt-points" class="input-glass w-full">
                  <option value="1">1 pt</option>
                  <option value="2">2 pts</option>
                  <option value="3" selected>3 pts</option>
                  <option value="5">5 pts</option>
                  <option value="8">8 pts</option>
                  <option value="13">13 pts</option>
                </select>
              </div>
              <div>
                <label class="form-label">Prioridad</label>
                <select id="m-pt-badge" class="input-glass w-full">
                  <option value="gold">Alta</option>
                  <option value="sky" selected>Media</option>
                  <option value="neutral">Baja</option>
                </select>
              </div>
            </div>
          </div>
        `,
        confirmLabel: '+ Agregar tarea',
        onConfirm: () => {
          const title = document.getElementById('m-pt-title')?.value?.trim();
          if (!title) { Toast.show('Escribe el título', 'warning'); return false; }
          Store.update('projectos', d => {
            d.tasks.backlog.unshift({
              id:       Store.uid(),
              title,
              notes:    document.getElementById('m-pt-notes')?.value?.trim() || '',
              points:   parseInt(document.getElementById('m-pt-points')?.value || 3, 10),
              badge:    document.getElementById('m-pt-badge')?.value || 'neutral',
              progress: 0,
              createdAt: Date.now()
            });
            return d;
          });
          refreshProjectos();
          Toast.show('Tarea agregada ✓');
        }
      });
    };

    document.getElementById('btn-add-sprint-task')?.addEventListener('click', openTaskModal);

    document.getElementById('btn-add-project')?.addEventListener('click', () => {
      Modal.open({
        title: 'Nuevo proyecto',
        body: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="form-label">Nombre del proyecto</label>
              <input id="m-proj-name" class="input-glass w-full" type="text" placeholder="ej. AlexOS v2" />
            </div>
            <div>
              <label class="form-label">Descripción</label>
              <input id="m-proj-desc" class="input-glass w-full" type="text" placeholder="En qué consiste…" />
            </div>
            <div class="g2" style="gap:var(--sp-3);">
              <div>
                <label class="form-label">Color</label>
                <select id="m-proj-color" class="input-glass w-full">
                  <option value="gold">Dorado</option>
                  <option value="emerald">Esmeralda</option>
                  <option value="sky">Azul</option>
                  <option value="sunset">Naranja</option>
                  <option value="neutral">Neutro</option>
                </select>
              </div>
              <div>
                <label class="form-label">Estado</label>
                <select id="m-proj-status" class="input-glass w-full">
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="done">Completado</option>
                </select>
              </div>
            </div>
            <div>
              <label class="form-label">Progreso: <span id="m-proj-prog-label">0%</span></label>
              <input id="m-proj-progress" type="range" min="0" max="100" value="0"
                     style="width:100%;accent-color:var(--gold);"
                     oninput="document.getElementById('m-proj-prog-label').textContent=this.value+'%'" />
            </div>
          </div>
        `,
        confirmLabel: '+ Agregar proyecto',
        onConfirm: () => {
          const name = document.getElementById('m-proj-name')?.value?.trim();
          if (!name) { Toast.show('Escribe el nombre', 'warning'); return false; }
          Store.update('projectos', d => {
            if (!d.projects) d.projects = [];
            d.projects.unshift({
              id:          Store.uid(),
              name,
              description: document.getElementById('m-proj-desc')?.value?.trim() || '',
              color:       document.getElementById('m-proj-color')?.value || 'gold',
              status:      document.getElementById('m-proj-status')?.value || 'active',
              progress:    parseInt(document.getElementById('m-proj-progress')?.value || 0, 10),
              createdAt:   Date.now()
            });
            return d;
          });
          refreshProjectos();
          Toast.show('Proyecto creado ✓');
        }
      });
    });

    document.getElementById('btn-add-milestone')?.addEventListener('click', () => {
      Modal.open({
        title: 'Nuevo hito',
        body: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="form-label">Título del hito</label>
              <input id="m-ms-title" class="input-glass w-full" type="text" placeholder="ej. MVP público" />
            </div>
            <div>
              <label class="form-label">Descripción</label>
              <input id="m-ms-desc" class="input-glass w-full" type="text" placeholder="Qué incluye este hito…" />
            </div>
            <div class="g2" style="gap:var(--sp-3);">
              <div>
                <label class="form-label">Período</label>
                <input id="m-ms-period" class="input-glass w-full" type="text" placeholder="ej. Q2 2026" />
              </div>
              <div>
                <label class="form-label">Estado</label>
                <select id="m-ms-status" class="input-glass w-full">
                  <option value="planned">Planificado</option>
                  <option value="active">En curso</option>
                  <option value="done">Completado</option>
                </select>
              </div>
            </div>
            <div>
              <label class="form-label">Progreso: <span id="m-ms-prog-label">0%</span></label>
              <input id="m-ms-progress" type="range" min="0" max="100" value="0"
                     style="width:100%;accent-color:var(--gold);"
                     oninput="document.getElementById('m-ms-prog-label').textContent=this.value+'%'" />
            </div>
          </div>
        `,
        confirmLabel: '+ Agregar hito',
        onConfirm: () => {
          const title = document.getElementById('m-ms-title')?.value?.trim();
          if (!title) { Toast.show('Escribe el título', 'warning'); return false; }
          Store.update('projectos', d => {
            if (!d.milestones) d.milestones = [];
            d.milestones.push({
              id:          Store.uid(),
              title,
              description: document.getElementById('m-ms-desc')?.value?.trim() || '',
              period:      document.getElementById('m-ms-period')?.value?.trim() || '',
              status:      document.getElementById('m-ms-status')?.value || 'planned',
              progress:    parseInt(document.getElementById('m-ms-progress')?.value || 0, 10),
            });
            return d;
          });
          renderMilestones();
          Toast.show('Hito agregado ✓');
        }
      });
    });
  }

  function renderProjectKPIs() {
    const data   = Store.load('projectos');
    const tasks  = data.tasks || { backlog:[], doing:[], done:[] };
    const total  = tasks.backlog.length + tasks.doing.length + tasks.done.length;
    const ptDone = tasks.done.reduce((s, t) => s + (t.points || 0), 0);
    const ptTotal= [tasks.backlog, tasks.doing, tasks.done].flat().reduce((s, t) => s + (t.points || 0), 0);
    const vel    = total > 0 ? Math.round((tasks.done.length / total) * 100) : 0;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('proj-kpi-total',  total);
    set('proj-kpi-doing',  tasks.doing.length);
    set('proj-kpi-done',   tasks.done.length);
    set('proj-kpi-points', ptDone);
    set('proj-kpi-points-label', `de ${ptTotal} pts totales`);
    set('proj-velocity',   vel + '%');

    const bar = document.getElementById('proj-velocity-bar');
    if (bar) bar.style.width = vel + '%';

    const sub = document.getElementById('proj-hero-sub');
    const projs = (data.projects || []).filter(p => p.status === 'active').length;
    if (sub) sub.textContent = `${projs} proyecto${projs !== 1 ? 's' : ''} activo${projs !== 1 ? 's' : ''} · ${total} tareas en sprint`;
  }

  function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const data     = Store.load('projectos');
    const projects = data.projects || [];
    grid.innerHTML = '';

    if (!projects.length) {
      grid.innerHTML = `<p style="color:var(--text-4);font-size:var(--text-sm);grid-column:1/-1;padding:var(--sp-2) 0;">Sin proyectos todavía. Agrega el primero →</p>`;
      return;
    }

    const STATUS_LABEL = { active:'Activo', paused:'Pausado', done:'Completado' };
    const STATUS_BADGE = { active:'badge-gold', paused:'badge-neutral', done:'badge-emerald' };

    projects.forEach(proj => {
      const c = PROJ_COLORS[proj.color] || PROJ_COLORS.gold;
      const div = document.createElement('div');
      div.className = 'card card-interactive card-in';
      div.style.cursor = 'pointer';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--sp-3);">
          <div style="min-width:0;">
            <p style="font-size:var(--text-sm);font-weight:600;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${proj.name}</p>
            <p style="font-size:var(--text-xs);color:var(--text-4);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${proj.description || '—'}</p>
          </div>
          <span class="badge ${STATUS_BADGE[proj.status] || 'badge-neutral'}" style="flex-shrink:0;margin-left:8px;">${STATUS_LABEL[proj.status] || proj.status}</span>
        </div>
        <div class="prog-track" style="height:4px;margin-bottom:5px;">
          <div class="prog-fill ${c.fill}" style="width:${proj.progress}%;"></div>
        </div>
        <p style="font-size:10px;color:${c.text};text-align:right;">${proj.progress}% completado</p>
      `;
      div.addEventListener('click', () => openEditProject(proj));
      grid.appendChild(div);
    });

    const subEl = document.getElementById('proj-projects-sub');
    if (subEl) {
      const active = projects.filter(p => p.status === 'active').length;
      subEl.textContent = `${projects.length} proyecto${projects.length !== 1 ? 's' : ''} · ${active} activo${active !== 1 ? 's' : ''}`;
    }
  }

  function openEditProject(proj) {
    const c = PROJ_COLORS[proj.color] || PROJ_COLORS.gold;
    Modal.open({
      title: proj.name,
      body: `
        <div class="flex flex-col gap-3">
          <div>
            <label class="form-label">Nombre</label>
            <input id="m-ep-name" class="input-glass w-full" value="${proj.name}" />
          </div>
          <div>
            <label class="form-label">Descripción</label>
            <input id="m-ep-desc" class="input-glass w-full" value="${proj.description || ''}" />
          </div>
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Color</label>
              <select id="m-ep-color" class="input-glass w-full">
                ${Object.keys(PROJ_COLORS).map(k => `<option value="${k}" ${k===proj.color?'selected':''}>${{gold:'Dorado',emerald:'Esmeralda',sky:'Azul',sunset:'Naranja',neutral:'Neutro'}[k]}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">Estado</label>
              <select id="m-ep-status" class="input-glass w-full">
                <option value="active"  ${proj.status==='active' ?'selected':''}>Activo</option>
                <option value="paused"  ${proj.status==='paused' ?'selected':''}>Pausado</option>
                <option value="done"    ${proj.status==='done'   ?'selected':''}>Completado</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Progreso: <span id="m-ep-prog-label">${proj.progress}%</span></label>
            <input id="m-ep-progress" type="range" min="0" max="100" value="${proj.progress}"
                   style="width:100%;accent-color:var(--gold);"
                   oninput="document.getElementById('m-ep-prog-label').textContent=this.value+'%'" />
          </div>
          <button id="m-ep-delete" class="btn btn-glass btn-sm" style="color:var(--sunset);margin-top:4px;">🗑 Eliminar proyecto</button>
        </div>
      `,
      confirmLabel: 'Guardar cambios',
      onConfirm: () => {
        const name = document.getElementById('m-ep-name')?.value?.trim();
        if (!name) { Toast.show('El nombre no puede estar vacío', 'warning'); return false; }
        Store.update('projectos', d => {
          const p = (d.projects || []).find(x => x.id === proj.id);
          if (p) {
            p.name        = name;
            p.description = document.getElementById('m-ep-desc')?.value?.trim() || '';
            p.color       = document.getElementById('m-ep-color')?.value   || proj.color;
            p.status      = document.getElementById('m-ep-status')?.value  || proj.status;
            p.progress    = parseInt(document.getElementById('m-ep-progress')?.value || proj.progress, 10);
          }
          return d;
        });
        refreshProjectos();
        Toast.show('Proyecto actualizado ✓');
      }
    });

    setTimeout(() => {
      document.getElementById('m-ep-delete')?.addEventListener('click', () => {
        Modal.open({
          title: 'Eliminar proyecto',
          body: `<p style="color:var(--text-2);">¿Eliminar <strong>${proj.name}</strong>? No se puede deshacer.</p>`,
          confirmLabel: 'Eliminar',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Store.update('projectos', d => { d.projects = (d.projects || []).filter(p => p.id !== proj.id); return d; });
            refreshProjectos();
            Toast.show('Proyecto eliminado', 'info');
          }
        });
      });
    }, 50);
  }

  function renderSprintKanban() {
    const data   = Store.load('projectos');
    const COLS   = ['backlog','doing','done'];
    const LABELS = { backlog:'Backlog', doing:'En curso', done:'Completado' };
    const NEXT   = { backlog:'doing', doing:'done', done:'backlog' };
    const BADGE_LABEL = { gold:'Alta', sky:'Media', neutral:'Baja', emerald:'✓' };

    COLS.forEach(col => {
      const el  = document.getElementById(`sprint-${col}`);
      const cnt = document.querySelector(`[data-sprint-count="${col}"]`);
      if (!el) return;
      if (cnt) cnt.textContent = data.tasks[col].length;
      el.innerHTML = '';

      if (!data.tasks[col].length) {
        el.innerHTML = `<p style="text-align:center;color:var(--text-4);font-size:10px;padding:var(--sp-4) 0;">Vacío</p>`;
        return;
      }

      data.tasks[col].forEach(task => {
        const card = document.createElement('div');
        card.className = 'kanban-card card-in';
        const prog = task.progress ?? (col === 'done' ? 100 : 0);
        const isDone = col === 'done';
        const c = PROJ_COLORS[task.badge] || PROJ_COLORS.neutral;

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:6px;">
            <p style="font-size:var(--text-xs);font-weight:500;color:${isDone?'var(--text-4)':'var(--text-2)'};${isDone?'text-decoration:line-through;':''}line-height:1.4;flex:1;cursor:pointer;" class="task-title-click">${task.title}</p>
            <button class="kc-move btn-kc" title="Mover a ${LABELS[NEXT[col]]}" style="flex-shrink:0;">${isDone?'↩':'→'}</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            ${task.badge ? `<span class="badge ${c.badge}" style="font-size:9px;">${BADGE_LABEL[task.badge]||task.badge}</span>` : ''}
            <span style="font-size:9px;color:var(--text-4);font-family:var(--font-mono);">${task.points}pt</span>
            ${col !== 'backlog' ? `<div class="prog-track" style="flex:1;min-width:40px;height:3px;"><div class="prog-fill ${c.fill}" style="width:${prog}%;"></div></div><span style="font-size:9px;color:var(--text-4);font-family:var(--font-mono);">${prog}%</span>` : ''}
          </div>
          ${col==='doing' ? `<input type="range" class="kc-progress-input" min="0" max="100" value="${prog}" style="width:100%;margin-top:8px;accent-color:var(--gold);cursor:pointer;" />` : ''}
        `;

        card.querySelector('.kc-move')?.addEventListener('click', e => {
          e.stopPropagation();
          Store.update('projectos', d => {
            const idx = d.tasks[col].findIndex(t => t.id === task.id);
            if (idx < 0) return d;
            const [t] = d.tasks[col].splice(idx, 1);
            if (NEXT[col] === 'done') t.progress = 100;
            d.tasks[NEXT[col]].unshift(t);
            return d;
          });
          refreshProjectos();
          Toast.show(`→ ${LABELS[NEXT[col]]}`);
        });

        card.querySelector('.task-title-click')?.addEventListener('click', e => {
          e.stopPropagation();
          openEditTask(task, col);
        });

        const progSlider = card.querySelector('.kc-progress-input');
        if (progSlider) {
          progSlider.addEventListener('input', () => {
            const v = parseInt(progSlider.value, 10);
            Store.update('projectos', d => {
              const t = d.tasks.doing.find(t => t.id === task.id);
              if (t) t.progress = v;
              return d;
            });
            const bar = card.querySelector('.prog-fill');
            if (bar) bar.style.width = v + '%';
            const pct = card.querySelectorAll('[style*="font-mono"]');
            pct.forEach(el => { if (el.textContent.includes('%')) el.textContent = v + '%'; });
          });
        }

        el.appendChild(card);
      });
    });
  }

  function openEditTask(task, col) {
    Modal.open({
      title: 'Editar tarea',
      body: `
        <div class="flex flex-col gap-3">
          <div>
            <label class="form-label">Título</label>
            <input id="m-et-title" class="input-glass w-full" value="${task.title}" />
          </div>
          <div>
            <label class="form-label">Notas</label>
            <textarea id="m-et-notes" class="input-glass textarea-glass w-full" style="min-height:64px;">${task.notes || ''}</textarea>
          </div>
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Story points</label>
              <select id="m-et-points" class="input-glass w-full">
                ${[1,2,3,5,8,13].map(p => `<option value="${p}" ${p===task.points?'selected':''}>${p} pt${p>1?'s':''}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">Prioridad</label>
              <select id="m-et-badge" class="input-glass w-full">
                <option value="gold"    ${task.badge==='gold'   ?'selected':''}>Alta</option>
                <option value="sky"     ${task.badge==='sky'    ?'selected':''}>Media</option>
                <option value="neutral" ${task.badge==='neutral'?'selected':''}>Baja</option>
              </select>
            </div>
          </div>
          <button id="m-et-delete" class="btn btn-glass btn-sm" style="color:var(--sunset);margin-top:4px;">🗑 Eliminar tarea</button>
        </div>
      `,
      confirmLabel: 'Guardar',
      onConfirm: () => {
        const title = document.getElementById('m-et-title')?.value?.trim();
        if (!title) { Toast.show('El título no puede estar vacío', 'warning'); return false; }
        Store.update('projectos', d => {
          const t = d.tasks[col].find(x => x.id === task.id);
          if (t) {
            t.title  = title;
            t.notes  = document.getElementById('m-et-notes')?.value?.trim() || '';
            t.points = parseInt(document.getElementById('m-et-points')?.value || task.points, 10);
            t.badge  = document.getElementById('m-et-badge')?.value || task.badge;
          }
          return d;
        });
        refreshProjectos();
        Toast.show('Tarea actualizada ✓');
      }
    });

    setTimeout(() => {
      document.getElementById('m-et-delete')?.addEventListener('click', () => {
        Modal.open({
          title: 'Eliminar tarea',
          body: `<p style="color:var(--text-2);">¿Eliminar <strong>${task.title}</strong>?</p>`,
          confirmLabel: 'Eliminar',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Store.update('projectos', d => { d.tasks[col] = d.tasks[col].filter(t => t.id !== task.id); return d; });
            refreshProjectos();
            Toast.show('Tarea eliminada', 'info');
          }
        });
      });
    }, 50);
  }

  function renderMilestones() {
    const list = document.getElementById('milestones-list');
    if (!list) return;
    const data       = Store.load('projectos');
    const milestones = data.milestones || [];
    list.innerHTML   = '';

    if (!milestones.length) {
      list.innerHTML = `<p style="color:var(--text-4);font-size:var(--text-sm);padding:var(--sp-2) 0;">Sin hitos todavía. Agrega el primero →</p>`;
      return;
    }

    const STATUS = {
      done:    { badge:'badge-emerald', label:'✓ Completado', color:'var(--emerald-2)', dot:'background:var(--emerald-2);box-shadow:0 0 0 3px rgba(46,125,94,0.18);', fill:'prog-emerald' },
      active:  { badge:'badge-gold',    label:'En curso',     color:'var(--gold-3)',    dot:'background:var(--gold);box-shadow:0 0 0 3px rgba(200,168,75,0.22);animation:gold-pulse 2.5s ease-in-out infinite;', fill:'prog-gold' },
      planned: { badge:'badge-sky',     label:'Planificado',  color:'var(--sky)',       dot:'background:rgba(52,112,184,0.25);border:1.5px solid var(--sky-2);', fill:'prog-sky' },
    };

    milestones.forEach((ms, i) => {
      const s    = STATUS[ms.status] || STATUS.planned;
      const last = i === milestones.length - 1;
      const div  = document.createElement('div');
      div.className = 'timeline-item';
      div.innerHTML = `
        <div class="timeline-stem">
          <div class="timeline-dot" style="${s.dot}"></div>
          ${!last ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-body" style="cursor:pointer;">
          <div class="flex justify-between items-start" style="margin-bottom:6px;">
            <div>
              <p style="font-size:var(--text-sm);font-weight:600;color:${s.color};">${ms.title}</p>
              ${ms.period ? `<p style="font-size:var(--text-xs);color:var(--text-4);margin-top:2px;">${ms.period}</p>` : ''}
            </div>
            <span class="badge ${s.badge}">${s.label}</span>
          </div>
          <div class="prog-track" style="margin-bottom:6px;">
            <div class="prog-fill ${s.fill}" style="width:${ms.progress}%;"></div>
          </div>
          ${ms.description ? `<p style="font-size:var(--text-xs);color:var(--text-3);">${ms.description}</p>` : ''}
        </div>
      `;
      div.querySelector('.timeline-body')?.addEventListener('click', () => openEditMilestone(ms));
      list.appendChild(div);
    });
  }

  function openEditMilestone(ms) {
    const STATUS_OPTS = [
      { v:'planned', l:'Planificado' },
      { v:'active',  l:'En curso' },
      { v:'done',    l:'Completado' },
    ];
    Modal.open({
      title: 'Editar hito',
      body: `
        <div class="flex flex-col gap-3">
          <div>
            <label class="form-label">Título</label>
            <input id="m-ems-title" class="input-glass w-full" value="${ms.title}" />
          </div>
          <div>
            <label class="form-label">Descripción</label>
            <input id="m-ems-desc" class="input-glass w-full" value="${ms.description || ''}" />
          </div>
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Período</label>
              <input id="m-ems-period" class="input-glass w-full" value="${ms.period || ''}" placeholder="ej. Q3 2026" />
            </div>
            <div>
              <label class="form-label">Estado</label>
              <select id="m-ems-status" class="input-glass w-full">
                ${STATUS_OPTS.map(o => `<option value="${o.v}" ${o.v===ms.status?'selected':''}>${o.l}</option>`).join('')}
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Progreso: <span id="m-ems-prog-label">${ms.progress}%</span></label>
            <input id="m-ems-progress" type="range" min="0" max="100" value="${ms.progress}"
                   style="width:100%;accent-color:var(--gold);"
                   oninput="document.getElementById('m-ems-prog-label').textContent=this.value+'%'" />
          </div>
          <button id="m-ems-delete" class="btn btn-glass btn-sm" style="color:var(--sunset);margin-top:4px;">🗑 Eliminar hito</button>
        </div>
      `,
      confirmLabel: 'Guardar',
      onConfirm: () => {
        const title = document.getElementById('m-ems-title')?.value?.trim();
        if (!title) { Toast.show('El título no puede estar vacío', 'warning'); return false; }
        Store.update('projectos', d => {
          const m = (d.milestones || []).find(x => x.id === ms.id);
          if (m) {
            m.title       = title;
            m.description = document.getElementById('m-ems-desc')?.value?.trim()   || '';
            m.period      = document.getElementById('m-ems-period')?.value?.trim() || '';
            m.status      = document.getElementById('m-ems-status')?.value         || ms.status;
            m.progress    = parseInt(document.getElementById('m-ems-progress')?.value || ms.progress, 10);
          }
          return d;
        });
        renderMilestones();
        Toast.show('Hito actualizado ✓');
      }
    });

    setTimeout(() => {
      document.getElementById('m-ems-delete')?.addEventListener('click', () => {
        Modal.open({
          title: 'Eliminar hito',
          body: `<p style="color:var(--text-2);">¿Eliminar <strong>${ms.title}</strong>?</p>`,
          confirmLabel: 'Eliminar',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Store.update('projectos', d => { d.milestones = (d.milestones || []).filter(m => m.id !== ms.id); return d; });
            renderMilestones();
            Toast.show('Hito eliminado', 'info');
          }
        });
      });
    }, 50);
  }

  /* ════════════════════════════════════════════════════════
     SECOND BRAIN — LIBROS
     ════════════════════════════════════════════════════════ */
  function initBooks() {
    renderBooks();

    document.getElementById('btn-add-book')?.addEventListener('click', () => {
      const COVERS = [
        { bg:'linear-gradient(145deg,#1A3A2A,#2E5C40)', text:'rgba(255,255,255,0.92)' },
        { bg:'linear-gradient(145deg,#2A1F00,#5A3D08)', text:'rgba(255,210,80,0.95)' },
        { bg:'linear-gradient(145deg,#1A1C3A,#2E3070)', text:'rgba(160,190,255,0.95)' },
        { bg:'linear-gradient(145deg,#3A1A14,#6B2E24)', text:'rgba(255,180,150,0.95)' },
        { bg:'linear-gradient(145deg,#1E1E2E,#383870)', text:'rgba(190,170,255,0.95)' },
        { bg:'linear-gradient(145deg,#1A2A20,#2E4838)', text:'rgba(140,220,180,0.95)' },
        { bg:'linear-gradient(145deg,#2A1A2E,#4A2E60)', text:'rgba(210,160,255,0.95)' },
        { bg:'linear-gradient(145deg,#1A2A3A,#2E4A60)', text:'rgba(140,195,255,0.95)' },
      ];
      const colorOpts = COVERS.map((c,i) => `<option value="${i}" style="background:${c.bg.split(',')[1]}">Color ${i+1}</option>`).join('');

      let _pendingPdfBuffer = null;

      Modal.open({
        title: 'Agregar libro',
        body: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="form-label">Título</label>
              <input id="m-book-title" class="input-glass w-full" type="text" placeholder="Título del libro" />
            </div>
            <div>
              <label class="form-label">Autor</label>
              <input id="m-book-author" class="input-glass w-full" type="text" placeholder="Nombre del autor" />
            </div>
            <div class="g2" style="gap:var(--sp-3);">
              <div>
                <label class="form-label">Color de portada</label>
                <select id="m-book-color" class="input-glass w-full">${colorOpts}</select>
              </div>
              <div>
                <label class="form-label">Estado</label>
                <select id="m-book-status" class="input-glass w-full">
                  <option value="queue">En cola</option>
                  <option value="reading">Leyendo ahora</option>
                  <option value="done">Completado</option>
                </select>
              </div>
            </div>
            <div class="g2" style="gap:var(--sp-3);">
              <div>
                <label class="form-label">Página actual</label>
                <input id="m-book-cur-page" class="input-glass w-full" type="number" min="0" placeholder="0" />
              </div>
              <div>
                <label class="form-label">Total de páginas</label>
                <input id="m-book-total-pages" class="input-glass w-full" type="number" min="1" placeholder="—" />
              </div>
            </div>
            <div>
              <label class="form-label">PDF del libro <span style="color:var(--text-4);font-weight:400;">(opcional)</span></label>
              <label id="m-book-pdf-label" style="display:flex;align-items:center;gap:var(--sp-2);padding:9px 14px;border:0.5px dashed rgba(200,168,75,0.35);border-radius:var(--r-lg);cursor:pointer;font-size:var(--text-sm);color:var(--text-3);transition:all var(--t-base);">
                <span>📄</span><span id="m-pdf-name">Seleccionar archivo PDF…</span>
                <input id="m-book-pdf" type="file" accept="application/pdf" style="display:none;" />
              </label>
            </div>
          </div>
        `,
        confirmLabel: '+ Agregar libro',
        onConfirm: () => {
          const title = document.getElementById('m-book-title')?.value?.trim();
          if (!title) { Toast.show('Escribe el título', 'warning'); return false; }

          const colorIdx  = parseInt(document.getElementById('m-book-color')?.value || 0, 10);
          const cover     = COVERS[colorIdx] || COVERS[0];
          const status    = document.getElementById('m-book-status')?.value || 'queue';
          const curPage   = parseInt(document.getElementById('m-book-cur-page')?.value  || 0, 10);
          const totalPgs  = parseInt(document.getElementById('m-book-total-pages')?.value || 0, 10);
          const prog      = (totalPgs > 0 && curPage > 0) ? Math.round((curPage / totalPgs) * 100) : 0;
          const bookId    = Store.uid();

          Store.update('secondbrain', d => {
            d.books.push({
              id: bookId, title,
              author:      document.getElementById('m-book-author')?.value?.trim() || 'Desconocido',
              progress:    status === 'done' ? 100 : prog,
              currentPage: curPage,
              totalPages:  totalPgs,
              status:      status === 'done' ? 'done' : curPage > 0 ? 'reading' : status,
              bg:          cover.bg, textColor: cover.text,
              hasPdf:      !!_pendingPdfBuffer
            });
            return d;
          });

          if (_pendingPdfBuffer) {
            PDFStore.save(bookId, _pendingPdfBuffer).then(() => {
              _pendingPdfBuffer = null;
            });
          }

          renderBooks();
          updateBrainKPIs();
          Toast.show('Libro agregado a tu biblioteca ✓');
        }
      });

      // PDF file picker
      setTimeout(() => {
        document.getElementById('m-book-pdf')?.addEventListener('change', e => {
          const file = e.target.files[0];
          if (!file) return;
          document.getElementById('m-pdf-name').textContent = file.name;
          file.arrayBuffer().then(buf => { _pendingPdfBuffer = buf; });
        });
      }, 50);
    });
  }

  function renderBooks() {
    const grid = document.getElementById('books-grid');
    if (!grid) return;
    const data = Store.load('secondbrain');
    grid.innerHTML = '';

    if (!data.books.length) {
      grid.innerHTML = `<p style="color:var(--text-4);font-size:var(--text-sm);padding:var(--sp-4);">Sin libros todavía. ¡Agrega el primero!</p>`;
      return;
    }

    data.books.forEach(book => {
      const hasPages   = book.totalPages > 0;
      const pageLabel  = hasPages
        ? `Pág. ${book.currentPage || 0} / ${book.totalPages}`
        : book.progress > 0 ? `${book.progress}%` : '';
      const statusText  = {
        reading: `En curso · ${pageLabel || book.progress + '%'}`,
        done:    '✓ Completado',
        queue:   'Cola · próximo'
      }[book.status] || '';
      const statusColor = { reading:'var(--gold-3)', done:'var(--emerald-3)', queue:'var(--text-4)' }[book.status] || 'var(--text-4)';

      const div = document.createElement('div');
      div.innerHTML = `
        <div class="book-cover" data-id="${book.id}" style="cursor:pointer;" title="Editar libro">
          <div class="book-body" style="background:${book.bg};">
            <span style="font-family:var(--font-serif);font-size:12px;color:${book.textColor};line-height:1.3;font-weight:400;">${book.title}</span>
          </div>
          ${book.hasPdf ? `<div style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.55);border-radius:4px;padding:2px 5px;font-size:10px;color:#fff;" title="PDF disponible">PDF</div>` : ''}
        </div>
        ${book.status === 'reading' ? `<div class="prog-track" style="margin:6px 0 3px;"><div class="prog-fill prog-emerald" style="width:${book.progress}%;"></div></div>` : ''}
        <p style="font-size:var(--text-10);color:${statusColor};text-align:center;margin-top:${book.status==='reading'?'2':'6'}px;">${statusText}</p>
        ${book.hasPdf ? `<button class="btn-read-pdf btn btn-glass btn-sm" data-id="${book.id}" data-title="${book.title.replace(/"/g,'&quot;')}" style="width:100%;margin-top:5px;font-size:10px;">📖 Leer PDF</button>` : ''}
      `;

      div.querySelector('.book-cover')?.addEventListener('click', () => openEditBook(book));
      div.querySelector('.btn-read-pdf')?.addEventListener('click', e => {
        e.stopPropagation();
        const btn = e.currentTarget;
        openPDFViewer(btn.dataset.id, btn.dataset.title);
      });
      grid.appendChild(div);
    });
  }

  let _pdfCurrentUrl = null;

  function closePDFViewer() {
    const overlay = document.getElementById('pdf-viewer-overlay');
    const frame   = document.getElementById('pdf-viewer-frame');
    if (overlay) overlay.style.display = 'none';
    if (frame)   frame.src = '';
    if (_pdfCurrentUrl) { URL.revokeObjectURL(_pdfCurrentUrl); _pdfCurrentUrl = null; }
  }

  function openPDFViewer(bookId, title) {
    const overlay = document.getElementById('pdf-viewer-overlay');
    const frame   = document.getElementById('pdf-viewer-frame');
    const titleEl = document.getElementById('pdf-viewer-title');
    if (!overlay || !frame) return;

    // Limpia estado anterior antes de abrir uno nuevo
    closePDFViewer();

    titleEl && (titleEl.textContent = title || 'Libro');
    overlay.style.display = 'flex';

    PDFStore.getBlob(bookId).then(blob => {
      if (!blob) { Toast.show('PDF no encontrado', 'error'); closePDFViewer(); return; }
      _pdfCurrentUrl = URL.createObjectURL(blob);
      frame.src = _pdfCurrentUrl;
    }).catch(() => { Toast.show('Error al cargar PDF', 'error'); closePDFViewer(); });
  }

  // Botón cerrar visor — listener único registrado una sola vez
  document.getElementById('pdf-viewer-close')?.addEventListener('click', closePDFViewer);

  function openEditBook(book) {
    let _editPdfBuffer = null;
    let _removePdf     = false;

    Modal.open({
      title: book.title,
      body: `
        <div class="flex flex-col gap-4">
          <div style="background:${book.bg};border-radius:var(--r-lg);padding:var(--sp-5);text-align:center;">
            <p style="font-family:var(--font-serif);font-size:var(--text-lg);color:${book.textColor};font-style:italic;">${book.title}</p>
            <p style="font-size:var(--text-xs);color:${book.textColor};opacity:0.7;margin-top:4px;">— ${book.author}</p>
          </div>
          <div>
            <label class="form-label">Estado</label>
            <select id="m-be-status" class="input-glass w-full">
              <option value="reading" ${book.status==='reading'?'selected':''}>Leyendo ahora</option>
              <option value="queue"   ${book.status==='queue'  ?'selected':''}>En cola</option>
              <option value="done"    ${book.status==='done'   ?'selected':''}>Completado</option>
            </select>
          </div>
          <div class="g2" style="gap:var(--sp-3);">
            <div>
              <label class="form-label">Página actual</label>
              <input id="m-be-cur-page" class="input-glass w-full" type="number" min="0"
                     value="${book.currentPage || 0}" placeholder="0" />
            </div>
            <div>
              <label class="form-label">Total de páginas</label>
              <input id="m-be-total-pages" class="input-glass w-full" type="number" min="1"
                     value="${book.totalPages || ''}" placeholder="—" />
            </div>
          </div>
          <div>
            <label class="form-label" style="color:var(--text-4);font-weight:400;">Progreso: <span id="m-be-prog-label">${book.progress}%</span></label>
            <input id="m-be-progress" type="range" min="0" max="100" value="${book.progress}"
                   style="width:100%;accent-color:var(--gold);"
                   oninput="document.getElementById('m-be-prog-label').textContent=this.value+'%'" />
            <p style="font-size:10px;color:var(--text-4);margin-top:3px;">Se calcula automáticamente si indicas páginas.</p>
          </div>
          <div>
            <label class="form-label">PDF</label>
            ${book.hasPdf
              ? `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                   <span id="m-be-pdf-status" style="font-size:var(--text-sm);color:var(--emerald-3);">✓ PDF subido</span>
                   <button id="m-be-pdf-read" class="btn btn-glass btn-sm" style="font-size:10px;">📖 Leer ahora</button>
                   <button id="m-be-pdf-remove" class="btn btn-glass btn-sm" style="font-size:10px;color:var(--sunset);">✕ Quitar PDF</button>
                 </div>`
              : `<label class="btn btn-glass btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);">
                   📎 Subir PDF <input id="m-be-pdf-file" type="file" accept="application/pdf" style="display:none;">
                 </label>
                 <span id="m-be-pdf-name" style="font-size:var(--text-xs);color:var(--text-4);margin-left:8px;"></span>`
            }
          </div>
          <div style="display:flex;gap:var(--sp-3);">
            <button id="m-be-delete" class="btn btn-glass btn-sm" style="color:var(--sunset);">🗑 Eliminar libro</button>
          </div>
        </div>
      `,
      confirmLabel: 'Guardar cambios',
      onConfirm: () => {
        const status    = document.getElementById('m-be-status')?.value || book.status;
        const curPage   = parseInt(document.getElementById('m-be-cur-page')?.value  || 0, 10);
        const totalPgs  = parseInt(document.getElementById('m-be-total-pages')?.value || 0, 10);
        const manualPct = parseInt(document.getElementById('m-be-progress')?.value || book.progress, 10);
        const progress  = status === 'done' ? 100
          : (totalPgs > 0 && curPage > 0) ? Math.round((curPage / totalPgs) * 100)
          : manualPct;

        Store.update('secondbrain', d => {
          const b = d.books.find(x => x.id === book.id);
          if (b) {
            b.status      = status;
            b.currentPage = curPage;
            b.totalPages  = totalPgs;
            b.progress    = progress;
            if (_removePdf)     { b.hasPdf = false; PDFStore.remove(book.id); }
            if (_editPdfBuffer) { b.hasPdf = true;  PDFStore.save(book.id, _editPdfBuffer); }
          }
          return d;
        });
        renderBooks();
        updateBrainKPIs();
        Toast.show('Libro actualizado ✓');
      }
    });

    setTimeout(() => {
      document.getElementById('m-be-delete')?.addEventListener('click', () => {
        Store.update('secondbrain', d => {
          d.books = d.books.filter(b => b.id !== book.id);
          return d;
        });
        if (book.hasPdf) PDFStore.remove(book.id);
        Modal.close();
        renderBooks();
        updateBrainKPIs();
        Toast.show('Libro eliminado', 'info');
      });

      document.getElementById('m-be-pdf-read')?.addEventListener('click', () => {
        Modal.close();
        openPDFViewer(book.id, book.title);
      });

      document.getElementById('m-be-pdf-remove')?.addEventListener('click', () => {
        _removePdf = true;
        const statusEl = document.getElementById('m-be-pdf-status');
        if (statusEl) statusEl.textContent = '✕ Se quitará al guardar';
        document.getElementById('m-be-pdf-remove')?.remove();
        document.getElementById('m-be-pdf-read')?.remove();
      });

      document.getElementById('m-be-pdf-file')?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        document.getElementById('m-be-pdf-name').textContent = file.name;
        file.arrayBuffer().then(buf => { _editPdfBuffer = buf; });
      });

      // Live progress preview from page inputs
      const updateProgLabel = () => {
        const cur   = parseInt(document.getElementById('m-be-cur-page')?.value  || 0, 10);
        const total = parseInt(document.getElementById('m-be-total-pages')?.value || 0, 10);
        const lbl   = document.getElementById('m-be-prog-label');
        if (lbl && total > 0 && cur > 0) {
          lbl.textContent = Math.round((cur / total) * 100) + '%';
          const slider = document.getElementById('m-be-progress');
          if (slider) slider.value = Math.round((cur / total) * 100);
        }
      };
      document.getElementById('m-be-cur-page')?.addEventListener('input', updateProgLabel);
      document.getElementById('m-be-total-pages')?.addEventListener('input', updateProgLabel);
    }, 50);
  }

  /* ════════════════════════════════════════════════════════
     SECOND BRAIN — IDEAS
     ════════════════════════════════════════════════════════ */
  function initIdeas() {
    renderIdeas();

    const openIdeaModal = () => {
      Modal.open({
        title: 'Capturar idea',
        body: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="form-label">Tu idea</label>
              <textarea id="m-idea-text" class="input-glass textarea-glass w-full" placeholder="Escribe la idea mientras está fresca…" style="min-height:100px;"></textarea>
            </div>
            <div>
              <label class="form-label">Categoría</label>
              <div class="flex gap-2 flex-wrap" id="m-idea-tags">
                <button class="tag-opt btn btn-glass btn-sm active" data-tag="NEGOCIO"  data-color="gold">Negocio</button>
                <button class="tag-opt btn btn-glass btn-sm"        data-tag="PRODUCTO" data-color="emerald">Producto</button>
                <button class="tag-opt btn btn-glass btn-sm"        data-tag="DISEÑO"   data-color="sky">Diseño</button>
                <button class="tag-opt btn btn-glass btn-sm"        data-tag="PERSONAL" data-color="sunset">Personal</button>
                <button class="tag-opt btn btn-glass btn-sm"        data-tag="TECH"     data-color="neutral">Tech</button>
              </div>
            </div>
          </div>
        `,
        confirmLabel: '💡 Guardar idea',
        onConfirm: () => {
          const text = document.getElementById('m-idea-text')?.value?.trim();
          if (!text) { Toast.show('Escribe la idea primero', 'warning'); return false; }

          const active = document.querySelector('.tag-opt.active');
          const tag    = active?.dataset.tag    || 'PERSONAL';
          const color  = active?.dataset.color  || 'sunset';

          Store.update('secondbrain', d => {
            d.ideas.unshift({ id: Store.uid(), text, tag, tagColor: color, createdAt: Date.now() });
            return d;
          });

          renderIdeas();
          updateBrainKPIs();
          Toast.show('Idea capturada ✓');
        }
      });

      // Toggle de tags en el modal
      setTimeout(() => {
        document.querySelectorAll('.tag-opt').forEach(b => {
          b.addEventListener('click', () => {
            document.querySelectorAll('.tag-opt').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
          });
        });
      }, 50);
    };

    document.getElementById('btn-add-idea')?.addEventListener('click', openIdeaModal);
    document.getElementById('btn-add-idea-2')?.addEventListener('click', openIdeaModal);

    // Search
    document.getElementById('ideas-search')?.addEventListener('input', e => {
      _ideasState.search = e.target.value;
      renderIdeas();
    });

    // Toggle collapse/expand
    document.getElementById('ideas-toggle-btn')?.addEventListener('click', () => {
      _ideasState.expanded = !_ideasState.expanded;
      renderIdeas();
    });
  }

  const _ideasState = { expanded: false, activeTag: 'TODAS', search: '' };
  const COLLAPSE_LIMIT = 5;

  function renderIdeas() {
    const list      = document.getElementById('ideas-list');
    const toggleBtn = document.getElementById('ideas-toggle-btn');
    const tagFilters= document.getElementById('ideas-tag-filters');
    if (!list) return;

    const data   = Store.load('secondbrain');
    const search = _ideasState.search.toLowerCase().trim();
    const active = _ideasState.activeTag;

    // Tag filter pills
    if (tagFilters) {
      const allTags = ['TODAS', ...new Set(data.ideas.map(i => i.tag))];
      tagFilters.innerHTML = allTags.map(tag => `
        <button class="btn btn-glass btn-sm idea-tag-pill${tag === active ? ' active' : ''}" data-tag="${tag}"
                style="font-size:10px;padding:3px 10px;">${tag}</button>
      `).join('');
      tagFilters.querySelectorAll('.idea-tag-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          _ideasState.activeTag = btn.dataset.tag;
          renderIdeas();
        });
      });
    }

    // Filter
    let filtered = data.ideas.filter(idea => {
      const matchTag    = active === 'TODAS' || idea.tag === active;
      const matchSearch = !search || idea.text.toLowerCase().includes(search) || idea.tag.toLowerCase().includes(search);
      return matchTag && matchSearch;
    });

    list.innerHTML = '';

    if (!filtered.length) {
      list.innerHTML = `<p style="text-align:center;color:var(--text-4);font-size:var(--text-sm);padding:var(--sp-5);">Sin ideas${search || active !== 'TODAS' ? ' con ese filtro' : ' todavía'}. ¡Captura la primera!</p>`;
      if (toggleBtn) toggleBtn.style.display = 'none';
      return;
    }

    const visible = _ideasState.expanded ? filtered : filtered.slice(0, COLLAPSE_LIMIT);

    visible.forEach(idea => {
      const div = document.createElement('div');
      div.className = 'card-sm glass-depth idea-card card-in';
      div.innerHTML = `
        <div class="flex justify-between items-start" style="margin-bottom:5px;">
          <span class="badge badge-${idea.tagColor}">${idea.tag}</span>
          <div class="flex gap-2 items-center">
            <span style="font-size:var(--text-10);color:var(--text-4);">${fmtDate(idea.createdAt)}</span>
            <button class="btn-kc btn-kc-del idea-del" data-id="${idea.id}" title="Eliminar">×</button>
          </div>
        </div>
        <p style="font-size:var(--text-sm);color:var(--text-2);line-height:1.5;">${idea.text}</p>
      `;

      div.querySelector('.idea-del')?.addEventListener('click', e => {
        e.stopPropagation();
        Modal.open({
          title: 'Eliminar idea',
          body: `<p style="color:var(--text-2);">¿Eliminar esta idea? No se puede deshacer.</p>`,
          confirmLabel: 'Eliminar',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Store.update('secondbrain', d => {
              d.ideas = d.ideas.filter(i => i.id !== idea.id);
              return d;
            });
            renderIdeas();
            updateBrainKPIs();
            Toast.show('Idea eliminada', 'info');
          }
        });
      });

      list.appendChild(div);
    });

    // Toggle button
    if (toggleBtn) {
      const hidden = filtered.length - COLLAPSE_LIMIT;
      if (filtered.length <= COLLAPSE_LIMIT) {
        toggleBtn.style.display = 'none';
      } else {
        toggleBtn.style.display = '';
        toggleBtn.textContent = _ideasState.expanded
          ? `Ver menos ▲`
          : `Ver todas (${filtered.length}) ▼`;
      }
    }
  }

  /* ════════════════════════════════════════════════════════
     SECOND BRAIN — HÁBITOS
     ════════════════════════════════════════════════════════ */
  function initHabits() {
    renderHabits();

    document.getElementById('btn-add-habit')?.addEventListener('click', () => {
      Modal.open({
        title: 'Nuevo hábito',
        body: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="form-label">Nombre del hábito</label>
              <input id="m-habit-name" class="input-glass w-full" type="text" placeholder="ej. Leer 30 minutos" />
            </div>
            <div>
              <label class="form-label">Emoji representativo</label>
              <input id="m-habit-emoji" class="input-glass w-full" type="text" placeholder="📖" maxlength="2" value="⭐" />
            </div>
          </div>
        `,
        confirmLabel: '+ Crear hábito',
        onConfirm: () => {
          const name = document.getElementById('m-habit-name')?.value?.trim();
          if (!name) { Toast.show('Escribe el nombre del hábito', 'warning'); return false; }

          Store.update('secondbrain', d => {
            d.habits.list.push({
              id:    Store.uid(),
              name,
              emoji: document.getElementById('m-habit-emoji')?.value || '⭐'
            });
            return d;
          });

          renderHabits();
          Toast.show('Hábito creado ✓');
        }
      });
    });
  }

  function renderHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    const data  = Store.load('secondbrain');
    const today = Store.today();

    // Últimos 28 días
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    container.innerHTML = '';

    data.habits.list.forEach(habit => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-4';
      row.style.flexWrap = 'wrap';

      const done   = days.filter(day => data.habits.log[day]?.[habit.id] === 'done').length;
      const pct    = Math.round((done / 28) * 100);
      const PROG_CLASS = pct >= 80 ? 'prog-emerald' : pct >= 50 ? 'prog-gold' : 'prog-sunset';

      row.innerHTML = `
        <div style="width:140px;flex-shrink:0;">
          <div class="flex items-center gap-2">
            <span>${habit.emoji}</span>
            <p style="font-size:var(--text-sm);font-weight:500;color:var(--text-2);">${habit.name}</p>
            <button class="btn-kc btn-kc-del habit-del" data-id="${habit.id}" title="Eliminar hábito" style="margin-left:auto;">×</button>
          </div>
          <p style="font-size:var(--text-10);color:var(--text-4);margin-top:2px;">${done}/28 días · ${pct}%</p>
          <div class="prog-track" style="margin-top:4px;"><div class="prog-fill ${PROG_CLASS}" style="width:${pct}%;"></div></div>
        </div>
        <div class="flex gap-1 flex-wrap" id="dots-${habit.id}"></div>
      `;

      const dotsWrap = row.querySelector(`#dots-${habit.id}`);

      days.forEach(day => {
        const log   = data.habits.log[day]?.[habit.id]; // 'done'|'missed'|undefined
        const isFut = day > today;
        const dot   = document.createElement('div');
        dot.className = `habit-dot ${isFut ? 'empty' : log === 'done' ? 'done' : log === 'missed' ? 'missed' : 'empty'}`;
        dot.title     = day;

        if (!isFut) {
          dot.style.cursor = 'pointer';
          dot.addEventListener('click', () => {
            Store.update('secondbrain', d => {
              if (!d.habits.log[day]) d.habits.log[day] = {};
              const cur = d.habits.log[day][habit.id];
              d.habits.log[day][habit.id] = cur === 'done' ? 'missed' : cur === 'missed' ? undefined : 'done';
              if (d.habits.log[day][habit.id] === undefined) delete d.habits.log[day][habit.id];
              return d;
            });
            renderHabits();
          });
        }

        dotsWrap.appendChild(dot);
      });

      row.querySelector('.habit-del')?.addEventListener('click', e => {
        e.stopPropagation();
        Store.update('secondbrain', d => {
          d.habits.list = d.habits.list.filter(h => h.id !== habit.id);
          return d;
        });
        renderHabits();
        Toast.show('Hábito eliminado', 'info');
      });

      container.appendChild(row);
    });
  }

  /* ════════════════════════════════════════════════════════
     SECOND BRAIN — KPIs
     ════════════════════════════════════════════════════════ */
  function updateBrainKPIs() {
    const data   = Store.load('secondbrain');
    const books  = data.books.filter(b => b.status === 'done').length;
    const ideas  = data.ideas.length;
    const habits = (data.habits || []).length;

    const bookEl  = document.getElementById('kpi-books');
    const ideaEl  = document.getElementById('kpi-ideas');
    const habitEl = document.getElementById('kpi-habits');
    if (bookEl)  bookEl.textContent  = books;
    if (ideaEl)  ideaEl.textContent  = ideas;
    if (habitEl) habitEl.textContent = habits;

    const sub = document.getElementById('brain-hero-sub');
    if (sub) {
      const parts = [];
      if (data.books.length)  parts.push(`${data.books.length} libro${data.books.length !== 1 ? 's' : ''}`);
      if (ideas)              parts.push(`${ideas} idea${ideas !== 1 ? 's' : ''}`);
      if (habits)             parts.push(`${habits} hábito${habits !== 1 ? 's' : ''}`);
      sub.textContent = parts.length ? parts.join(' · ') : 'Tu conocimiento, organizado';
    }

    const ideasSub = document.getElementById('ideas-sub');
    if (ideasSub) ideasSub.textContent = ideas ? `${ideas} idea${ideas !== 1 ? 's' : ''} guardada${ideas !== 1 ? 's' : ''}` : 'Tus pensamientos e insights';
  }

  /* ════════════════════════════════════════════════════════
     CHAT IA — Contexto real + Claude API
     ════════════════════════════════════════════════════════ */

  function buildAlexContext() {
    const today   = Store.today();
    const dayos   = Store.load('dayos');
    const wealth  = Store.load('wealthos');
    const proj    = Store.load('projectos');
    const brain   = Store.load('secondbrain');
    const now     = new Date();
    const hour    = now.getHours();

    const lines = [];
    lines.push(`Fecha y hora actual: ${today}, ${hour}:${String(now.getMinutes()).padStart(2,'0')}`);

    // DayOS — Agenda de hoy
    const blocks = (dayos.agenda?.[today] || []);
    if (blocks.length) {
      lines.push('\nAGENDA DE HOY:');
      blocks.forEach(b => lines.push(`  ${b.time} — ${b.title}${b.desc ? ' (' + b.desc + ')' : ''}`));
    } else {
      lines.push('\nAGENDA DE HOY: Sin bloques registrados');
    }

    // DayOS — Hábitos (Second Brain)
    const brainHabits = brain.habits || [];
    if (brainHabits.length) {
      const doneH = brainHabits.filter(h => h.streak > 0).length;
      lines.push(`\nHÁBITOS (Second Brain): ${brainHabits.length} registrados, ${doneH} con racha activa`);
      brainHabits.slice(0, 5).forEach(h => lines.push(`  ${h.name} — racha: ${h.streak || 0} días`));
    }

    // DayOS — Reflexiones recientes (últimas 3)
    const refs = Object.entries(dayos.reflection || {}).sort(([a],[b]) => b.localeCompare(a)).slice(0, 3);
    if (refs.length) {
      lines.push('\nREFLEXIONES RECIENTES:');
      refs.forEach(([date, r]) => {
        lines.push(`  [${date}]`);
        if (r.q1) lines.push(`    Logro: ${r.q1}`);
        if (r.q2) lines.push(`    Aprendizaje: ${r.q2}`);
        if (r.q3) lines.push(`    Mejoraría: ${r.q3}`);
        if (r.q4) lines.push(`    Energía: ${r.q4}`);
        if (r.q5) lines.push(`    Gratitud: ${r.q5}`);
      });
    }

    // DayOS — Board (tareas)
    const tasks = dayos.kanban || {};
    const todoTasks = (tasks.todo || []).map(t => t.title);
    const inpTasks  = (tasks.doing || []).map(t => t.title);
    const doneTasks = (tasks.done || []).map(t => t.title);
    lines.push(`\nBOARD DE TAREAS:`);
    if (todoTasks.length)  lines.push('  Por hacer: ' + todoTasks.join(', '));
    if (inpTasks.length)   lines.push('  En progreso: ' + inpTasks.join(', '));
    if (doneTasks.length)  lines.push('  Completadas: ' + doneTasks.join(', '));
    if (!todoTasks.length && !inpTasks.length && !doneTasks.length) lines.push('  Sin tareas');

    // WealthOS — resumen
    const assets = wealth.assets || [];
    if (assets.length) {
      const total = assets.reduce((s, a) => s + (Number(a.value) || 0), 0);
      lines.push(`\nWEALTH: ${assets.length} activos, valor total ~$${total.toLocaleString()}`);
    }

    // ProjectOS — sprints
    const sprints = proj.sprints || [];
    const activeSprint = sprints.find(s => s.active);
    if (activeSprint) lines.push(`\nPROYECTOS: Sprint activo "${activeSprint.name}" — ${(activeSprint.tasks || []).length} tareas`);

    // Second Brain — resumen
    const books = brain.books || [];
    const ideas = brain.ideas || [];
    lines.push(`\nSECOND BRAIN: ${books.length} libros, ${ideas.length} ideas registradas`);

    return lines.join('\n');
  }

  async function callClaude(userMessage, thinkingBubble) {
    const apiKey = localStorage.getItem('alexos_claude_key');
    if (!apiKey) {
      return '⚙ Necesito una API key de Claude para responderte. Haz clic en el botón ⚙ del chat y pégala ahí.';
    }

    const context = buildAlexContext();

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: `Eres el asistente personal de Alex dentro de AlexOS, su sistema operativo personal. Tienes acceso en tiempo real a todos sus módulos. Responde siempre en español, de forma concisa y directa. Si te preguntan sobre algo que no está en el contexto, dilo claramente. No inventes datos.\n\nCONTEXTO ACTUAL DE ALEXOS:\n${context}`,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) return '🔑 API key inválida. Verifica la clave en ⚙.';
        return `Error ${res.status}: ${err.error?.message || 'problema con la API'}`;
      }

      const data = await res.json();
      return data.content?.[0]?.text || 'Sin respuesta de la IA.';
    } catch (e) {
      return 'No pude conectar con Claude. Verifica tu conexión a internet.';
    }
  }

  function initChats() {
    document.querySelectorAll('.chat-send').forEach(btn => {
      btn.addEventListener('click', () => sendChat(btn));
    });

    document.querySelectorAll('.chat-field').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const btn = inp.closest('[class*="card"]')?.querySelector('.chat-send');
          if (btn) sendChat(btn);
        }
      });
    });
  }

  function sendChat(btn) {
    const card = btn.closest('[class*="card"]');
    const inp  = card?.querySelector('.chat-field');
    const msgs = card?.querySelector('.chat-messages');
    if (!inp || !msgs || !inp.value.trim()) return;

    const text = inp.value.trim();
    inp.value  = '';

    appendBubble(msgs, text, 'user');
    btn.disabled = true;
    inp.disabled = true;
    const thinking = appendBubble(msgs, '…', 'ai');

    callClaude(text, thinking).then(reply => {
      thinking.querySelector('.bubble-text').textContent = reply;
      btn.disabled = false;
      inp.disabled = false;
      inp.focus();
      msgs.scrollTop = msgs.scrollHeight;
    });
  }

  function appendBubble(msgs, text, role) {
    const row = document.createElement('div');
    row.className = `chat-row ${role}`;

    const av = document.createElement('div');
    av.className = 'chat-avatar-sm';
    Object.assign(av.style, role === 'user'
      ? { background:'rgba(200,168,75,0.15)', color:'var(--gold-3)' }
      : { background:'rgba(26,92,69,0.12)',   color:'var(--emerald-2)' });
    av.textContent = role === 'user' ? 'AS' : 'AI';

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = `<span class="bubble-text">${text}</span>`;

    if (role === 'user') { row.appendChild(av); row.insertBefore(bubble, av); }
    else                 { row.appendChild(av); row.appendChild(bubble); }

    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return bubble;
  }

  /* ════════════════════════════════════════════════════════
     BARRAS DE PROGRESO — IntersectionObserver
     ════════════════════════════════════════════════════════ */
  function initProgressBars() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const fill = e.target;
        const w    = fill.dataset.w;
        if (w !== undefined) {
          fill.style.width = '0%';
          requestAnimationFrame(() => {
            fill.style.transition = 'width 0.8s cubic-bezier(0.4,0,0.2,1)';
            fill.style.width = w + '%';
          });
        }
        io.unobserve(fill);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.prog-fill[data-w]').forEach(el => io.observe(el));
  }

  /* ════════════════════════════════════════════════════════
     QUICK STATS — actualizar badges y sidebar counts
     ════════════════════════════════════════════════════════ */
  function updateAllStats() {
    const dayos = Store.load('dayos');

    // Tareas activas (todo + doing)
    const active = (dayos.kanban?.todo?.length || 0) + (dayos.kanban?.doing?.length || 0);
    const boardEl = document.getElementById('stat-board-active');
    if (boardEl) boardEl.textContent = active;

    // Total reflexiones guardadas
    const refCount = Object.keys(dayos.reflection || {}).length;
    const refEl = document.getElementById('stat-reflections');
    if (refEl) refEl.textContent = refCount;

    updateNextEventStat();
    updateSidebarCounts();
  }

  function updateSidebarCounts() {
    const dayos      = Store.load('dayos');
    const priDone    = dayos.priorities.filter(p => p.done).length;
    const priTotal   = dayos.priorities.filter(p => p.text?.trim()).length;
    const boardCount = dayos.kanban.todo.length + dayos.kanban.doing.length;

    const sbPri   = document.getElementById('sb-priorities');
    const sbBoard = document.getElementById('sb-board');
    if (sbPri)   sbPri.textContent   = priTotal > 0 ? `${priDone}/${priTotal}` : '0';
    if (sbBoard) sbBoard.textContent = boardCount;
  }

  /* ════════════════════════════════════════════════════════
     MODAL — wiring confirm button
     ════════════════════════════════════════════════════════ */
  function initModalConfirm() {
    document.querySelector('.modal-confirm')?.addEventListener('click', () => Modal.confirm());
  }

  /* ════════════════════════════════════════════════════════
     SIDEBAR — grupos por módulo + scroll interno
     ════════════════════════════════════════════════════════ */
  function initSidebar() {
    const groups = document.querySelectorAll('.sidebar-module-group');

    function activateGroup(module) {
      groups.forEach(g => {
        g.classList.toggle('sidebar-active', g.dataset.sidebarFor === module);
      });
    }

    // Scroll interno dentro del módulo activo
    document.querySelectorAll('[data-scroll-to]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(el.dataset.scrollTo);
        if (!target) return;

        const main = document.querySelector('.main-content');
        if (main) main.scrollTo({ top: target.offsetTop - 12, behavior: 'smooth' });

        // Actualizar estado activo en el grupo
        el.closest('.sidebar-module-group')
          ?.querySelectorAll('.sidebar-item')
          .forEach(i => i.classList.remove('active'));
        el.classList.add('active');
      });
    });

    // Reaccionar al cambio de módulo
    window.addEventListener('moduleChanged', ({ detail }) => {
      activateGroup(detail.module);
      // Reset al primer item del grupo
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      document.querySelector(`[data-sidebar-for="${detail.module}"] [data-module]`)
        ?.classList.add('active');
      updateSidebarCounts();
    });

    // Estado inicial
    activateGroup('dayos');
    updateSidebarCounts();
  }

  /* ════════════════════════════════════════════════════════
     FLOATING CHAT IA
     ════════════════════════════════════════════════════════ */
  function initFloatingChat() {
    const fab   = document.getElementById('chat-fab');
    const panel = document.getElementById('chat-panel');
    const close = document.getElementById('chat-panel-close');
    const field = document.getElementById('chat-global-field');
    const send  = document.getElementById('chat-global-send');
    if (!fab) return;

    function toggleChat() {
      const opening = !panel.classList.contains('open');
      panel.classList.toggle('open');
      fab.classList.toggle('open');
      if (opening) setTimeout(() => field?.focus(), 280);
    }

    fab.addEventListener('click', toggleChat);
    close?.addEventListener('click', toggleChat);

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('open')) toggleChat();
    });

    send?.addEventListener('click', () => sendGlobalChat());
    field?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendGlobalChat(); }
    });

    // Config API key
    document.getElementById('chat-api-key-btn')?.addEventListener('click', () => {
      const current = localStorage.getItem('alexos_claude_key') || '';
      Modal.open({
        title: 'API Key de Claude',
        body: `<div class="flex flex-col gap-3">
          <p style="font-size:var(--text-sm);color:var(--text-3);">Ingresa tu API key de Anthropic. Se guarda solo en tu navegador (localStorage).</p>
          <input id="api-key-input" class="input-glass" type="password" placeholder="sk-ant-..." value="${current}" autocomplete="off" />
          <a href="https://console.anthropic.com/settings/keys" target="_blank" style="font-size:var(--text-xs);color:var(--gold-3);">Obtener API key →</a>
        </div>`,
        confirmText: 'Guardar',
        onConfirm: () => {
          const key = document.getElementById('api-key-input')?.value?.trim();
          if (key) {
            localStorage.setItem('alexos_claude_key', key);
            Toast.show('API key guardada ✓');
          } else {
            localStorage.removeItem('alexos_claude_key');
            Toast.show('API key eliminada', 'info');
          }
        }
      });
    });
  }

  function sendGlobalChat() {
    const field = document.getElementById('chat-global-field');
    const msgs  = document.getElementById('chat-global-messages');
    const btn   = document.getElementById('chat-global-send');
    if (!field || !msgs || !field.value.trim()) return;

    const empty = msgs.querySelector('.chat-empty');
    if (empty) empty.remove();

    const text = field.value.trim();
    field.value = '';

    appendBubble(msgs, text, 'user');
    btn.disabled   = true;
    field.disabled = true;
    const thinking = appendBubble(msgs, '…', 'ai');

    callClaude(text, thinking).then(reply => {
      thinking.querySelector('.bubble-text').textContent = reply;
      btn.disabled   = false;
      field.disabled = false;
      field.focus();
      msgs.scrollTop = msgs.scrollHeight;
    });
  }

  /* ════════════════════════════════════════════════════════
     ROUTER — re-renderizar al cambiar módulo
     ════════════════════════════════════════════════════════ */
  window.addEventListener('moduleChanged', ({ detail }) => {
    const { module } = detail;
    if (module === 'wealthos')    { refreshWealth(); }
    if (module === 'projectos')   { refreshProjectos(); }
    if (module === 'secondbrain') { renderBooks(); renderIdeas(); renderHabits(); updateBrainKPIs(); }
    if (module === 'dayos')       { renderKanban(); renderPriorities(); renderWeekTabs(); renderAgendaBlocks(agendaSelectedDate); updateAllStats(); renderReflectionHistory(); updateGreeting(); }
  });

  /* ════════════════════════════════════════════════════════
     INIT — arrancar todo
     ════════════════════════════════════════════════════════ */
  Toast.init();
  Modal.init();
  initModalConfirm();
  initClock();
  initWeather();
  initLiveOS();
  updateGreeting();
  setInterval(updateGreeting, 60000); // actualizar cada minuto
  initToggles();

  // DayOS
  initEnergy();
  initPriorities();
  initKanban();
  initAgenda();
  initReflection();

  // WealthOS
  initWealth();

  // ProjectOS
  initProjectos();

  // Second Brain
  initBooks();
  initIdeas();
  initHabits();
  updateBrainKPIs();

  // Sidebar con grupos de módulo
  initSidebar();

  // Chat flotante global
  initFloatingChat();

  // Chats embebidos (módulos con chat propio)
  initChats();

  // Progress bars estáticas
  initProgressBars();

  // Stats iniciales
  updateAllStats();

});
