# AlexOS Design System

Sistema de diseño glassmorphism premium, inspirado en iOS 18 + Apple Vision Pro + Linear.

## Cómo abrir localmente

### Opción 1 — XAMPP (recomendado, ya configurado)
1. Asegúrate de que Apache esté corriendo en XAMPP
2. Abre Chrome y navega a:
   - Landing/Login: `http://localhost/AlexOS/alexos-design/index.html`
   - App completa:  `http://localhost/AlexOS/alexos-design/app.html`

### Opción 2 — VS Code Live Server
1. Instala la extensión "Live Server" en VS Code
2. Clic derecho en `index.html` → "Open with Live Server"

### Opción 3 — Python HTTP Server
```bash
cd alexos-design
python -m http.server 8080
# Abrir: http://localhost:8080
```

## Estructura

```
alexos-design/
├── index.html              — Landing / Login glass
├── app.html                — App completa con los 4 módulos
├── css/
│   ├── design-system.css   — Variables, tokens, clases glass base
│   ├── components.css      — Buttons, cards, inputs, badges, timer
│   ├── layout.css          — Navbar, sidebar, grid, shell
│   └── animations.css      — Keyframes, hover, microinteracciones
├── js/
│   ├── router.js           — Navegación SPA por hash sin recarga
│   └── app.js              — Energía, pomodoro, chat IA, hábitos
└── modules/
    ├── dayos.html          — Vista standalone DayOS
    ├── wealthos.html       — Vista standalone WealthOS
    ├── projectos.html      — Vista standalone ProjectOS
    └── secondbrain.html    — Vista standalone Second Brain
```

## Notas técnicas

- **Sin frameworks** — HTML/CSS/JS vanilla puro
- **Backdrop-filter** — Requiere Chrome 76+ / Safari 14+ / Edge 79+
- **Google Fonts** — Requiere conexión a internet (Cormorant Garamond, Inter, JetBrains Mono)
- **Glass visible** — Los orbs de color detrás de las cards son necesarios para que el blur se vea
- **Navegación** — Usa hash routing (`#dayos`, `#wealthos`, etc.)

## Paleta rápida

| Token | Valor | Uso |
|---|---|---|
| `--gold` | `#C8A84B` | Identidad, primarios |
| `--emerald` | `#1A5C45` | Finanzas, salud |
| `--sunset` | `#E8773A` | Energía, alertas |
| `--bg-base` | `#F8F6F1` | Fondo mármol |
