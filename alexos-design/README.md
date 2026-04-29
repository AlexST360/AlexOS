# AlexOS

**Sistema operativo personal** diseñado para gestionar el día, las finanzas, los proyectos y el conocimiento desde un solo lugar. Construido con HTML, CSS y JavaScript vanilla puro — sin frameworks, sin dependencias pesadas, rendimiento máximo.

> Primera versión pública. El inicio (landing + app shell) y el módulo de biblioteca de libros están completamente pulidos.

---

## ¿Qué es AlexOS?

AlexOS es una aplicación web personal compuesta por cuatro módulos:

- **DayOS** — Gestión del día: agenda, kanban, pomodoro, energía y reflexiones diarias
- **WealthOS** — Control financiero: activos, ingresos, gastos y tasa de ahorro
- **ProjectOS** — Seguimiento de proyectos con tablero tipo sprint
- **SegundOS** — Segunda mente: biblioteca de libros con PDF integrado, captura de ideas y tracker de hábitos

Todo el dato vive en el navegador (localStorage + IndexedDB para PDFs). Sin servidor, sin cuenta, sin tracking.

---

## Estado de la v1

| Módulo | Estado |
|---|---|
| Landing / Login | ✅ Pulido |
| App shell (navbar, sidebar, clima, reloj) | ✅ Pulido |
| Biblioteca de libros (SegundOS) | ✅ Pulido — upload PDF, página actual, visor integrado |
| DayOS | 🔧 Funcional, en refinamiento |
| WealthOS | 🔧 Funcional, en refinamiento |
| ProjectOS | 🔧 Funcional, en refinamiento |
| Ideas y hábitos (SegundOS) | 🔧 Funcional, en refinamiento |

---

## Cómo abrir localmente

### Opción 1 — XAMPP (recomendado)
1. Clona el repo en `c:/xampp/htdocs/AlexOS`
2. Abre XAMPP y arranca Apache
3. Navega a:
   - Landing: `http://localhost/AlexOS/alexos-design/index.html`
   - App: `http://localhost/AlexOS/alexos-design/app.html`

### Opción 2 — VS Code Live Server
1. Instala la extensión "Live Server"
2. Clic derecho en `index.html` → "Open with Live Server"

### Opción 3 — Python
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
│   ├── components.css      — Botones, cards, inputs, badges
│   ├── layout.css          — Navbar, sidebar, grid
│   └── animations.css      — Keyframes y microinteracciones
├── js/
│   ├── store.js            — Capa de datos (localStorage)
│   ├── pdfstore.js         — Almacenamiento de PDFs (IndexedDB)
│   ├── router.js           — Navegación SPA por hash
│   └── app.js              — Toda la lógica de los módulos
└── modules/
    ├── dayos.html
    ├── wealthos.html
    ├── projectos.html
    └── secondbrain.html
```

---

## Tecnologías

- HTML / CSS / JavaScript vanilla — sin frameworks
- IndexedDB — almacenamiento de archivos PDF
- Open-Meteo API — clima en tiempo real (sin API key)
- Hash routing — navegación SPA sin recarga de página
- Google Fonts — Cormorant Garamond, Inter, JetBrains Mono

---

## Contribuyentes

- [Alex Soto](https://github.com/AlexST360)
