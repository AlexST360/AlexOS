# AlexOS

Sistema operativo personal diseñado para gestionar el día, las finanzas, los proyectos y el conocimiento desde un solo lugar. Construido con HTML, CSS y JavaScript vanilla puro — sin frameworks, sin dependencias pesadas, rendimiento máximo.

---

## ¿Qué es AlexOS?

AlexOS es una aplicación web personal compuesta por cuatro módulos:

- **DayOS** — Gestión del día: agenda con calendario mensual, kanban con drag & drop, pomodoro, energía y reflexiones diarias
- **WealthOS** — Control financiero: activos, ingresos, gastos desglosados por categoría y tasa de ahorro
- **ProjectOS** — Seguimiento de proyectos con sprint board filtrable, roadmap tipo Gantt y gestión de hitos
- **SegundOS** — Segunda mente: biblioteca de libros con PDF integrado, captura de ideas y tracker de hábitos

Todo el dato vive en el navegador (localStorage + IndexedDB para PDFs). Sin servidor, sin cuenta, sin tracking.

---

## Estado

| Módulo | Estado |
|---|---|
| Landing / Login | ✅ Pulido |
| App shell (navbar, sidebar, clima, reloj) | ✅ Pulido |
| DayOS | ✅ Completo — kanban drag & drop, calendario agenda, pomodoro, reflexiones |
| WealthOS | ✅ Completo — activos, cash flow con categorías, sparklines en vivo |
| ProjectOS | ✅ Completo — sprint board, roadmap Gantt, filtros por proyecto |
| LiveOS | ✅ Completo — precios en tiempo real, tipo de cambio, actividad GitHub |
| Biblioteca de libros (SegundOS) | ✅ Pulido — upload PDF, visor integrado, página actual |
| Ideas y hábitos (SegundOS) | ✅ Funcional |

---

## Funcionalidades por módulo

### DayOS
- Nivel de energía diario (alta / media / baja)
- Top 3 prioridades del día con estado done/pending
- Kanban personal (Por hacer / En curso / Hecho) con **drag & drop** entre columnas
- **Mini calendario mensual** en la agenda con navegación por mes y puntos de eventos
- Sesiones Pomodoro con contador diario
- Reflexión diaria guardada por fecha

### WealthOS
- Portfolio de activos con valor, cambio % y sparkline de precio en tiempo real
- Donut chart de distribución de activos por tipo
- Cash flow mensual (ingresos vs. egresos)
- **Breakdown de gastos por categoría** con barra de progreso y edición inline
- Tasa de ahorro calculada automáticamente

### ProjectOS
- **Sprint board** (Backlog / En curso / Hecho) con drag & drop
- **Filtro por proyecto** — pills interactivas que filtran el board al instante
- Botón contextual "+ Tarea en [Proyecto]" al seleccionar un proyecto
- Gestión de proyectos con color, descripción y estado
- **Roadmap tipo Gantt** con barras posicionadas por fecha de inicio/fin, progreso visual y estado (Planificado / Activo / Completado)
- Indicador "HOY" en la línea de tiempo del Gantt

### LiveOS
- Precios en tiempo real: BTC, ETH, S&P 500, NASDAQ, Oro
- Sparklines de 7 días por activo
- Tipo de cambio USD/CLP con cruces BTC/CLP y ETH/CLP
- Actividad reciente del repositorio en GitHub

### SegundOS
- Biblioteca de libros con upload de PDF y visor integrado
- Tracker de página actual y notas por libro
- Captura de ideas con búsqueda y etiquetas
- Tracker de hábitos con log diario y racha

---

## Datos en vivo — APIs utilizadas

| API | Uso | Key requerida |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Clima (Santiago) | No |
| [CoinGecko](https://www.coingecko.com/api) | Precios crypto + histórico 7d | No |
| [Alpha Vantage](https://www.alphavantage.co) | S&P 500, NASDAQ, Oro | Sí (plan free) |
| [ExchangeRate-API](https://www.exchangerate-api.com) | USD/CLP y cruces | No |
| [GitHub API](https://docs.github.com/en/rest) | Actividad del repo | No (rate-limited) |

---

## Cómo abrir localmente

**Opción 1 — XAMPP (recomendado)**
```
Clona el repo en c:/xampp/htdocs/AlexOS
Abre XAMPP y arranca Apache
```
- Landing: `http://localhost/AlexOS/alexos-design/index.html`
- App: `http://localhost/AlexOS/alexos-design/app.html`

**Opción 2 — VS Code Live Server**
```
Instala la extensión "Live Server"
Clic derecho en index.html → "Open with Live Server"
```

**Opción 3 — Python**
```bash
cd alexos-design
python -m http.server 8080
# http://localhost:8080
```

---

## Estructura

```
alexos-design/
├── index.html              — Landing / Login
├── app.html                — App principal (4 módulos)
├── css/
│   ├── design-system.css   — Variables y tokens de diseño
│   ├── components.css      — Botones, cards, inputs, badges, kanban, gantt, calendario
│   ├── layout.css          — Navbar, sidebar, grid
│   └── animations.css      — Keyframes y microinteracciones
├── js/
│   ├── store.js            — Capa de datos (localStorage)
│   ├── pdfstore.js         — Almacenamiento de PDFs (IndexedDB)
│   ├── router.js           — Navegación SPA por hash
│   ├── apiCache.js         — Caché TTL para APIs externas
│   ├── app.js              — Toda la lógica de los módulos
│   └── services/
│       ├── cryptoService.js   — Precios crypto (CoinGecko)
│       ├── stockService.js    — Índices y materias primas (Alpha Vantage)
│       ├── marketService.js   — Tipo de cambio (ExchangeRate-API)
│       └── githubService.js   — Actividad GitHub
└── modules/
    ├── dayos.html
    ├── wealthos.html
    ├── projectos.html
    └── secondbrain.html
```

---

## Tecnologías

- HTML / CSS / JavaScript vanilla — sin frameworks ni dependencias
- localStorage — persistencia de todos los datos del usuario
- IndexedDB — almacenamiento de archivos PDF
- HTML5 Drag & Drop API — kanban interactivo
- CSS Grid — layout del Gantt y calendario
- Hash routing — navegación SPA sin recarga de página
- Google Fonts — Cormorant Garamond, Inter, JetBrains Mono

---

## Historial de versiones

| Versión | Rama | Descripción |
|---|---|---|
| v1.0 | `master` | App shell, módulos base, biblioteca PDF |
| v1.1 | `master` | LiveOS: mercados en tiempo real + GitHub |
| v1.2 | `master` | Drag & drop kanban, Gantt roadmap, calendario agenda, categorías de gastos, filtros de proyecto |
| v1.3 | `dev` | En desarrollo |

---

## Autor

Desarrollado por [Alex ST](https://github.com/AlexST360)
