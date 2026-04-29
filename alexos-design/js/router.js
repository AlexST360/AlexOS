/* ============================================================
   AlexOS Router — Navegación entre módulos sin recarga
   ============================================================ */

const Router = (() => {
  /* Módulos disponibles */
  const MODULES = ['dayos', 'wealthos', 'projectos', 'secondbrain'];

  let currentModule = 'dayos';

  /* Inicializa el router */
  function init() {
    // Leer hash inicial o usar dayos
    const hash = location.hash.replace('#', '') || 'dayos';
    navigateTo(MODULES.includes(hash) ? hash : 'dayos', false);

    // Escuchar cambios de hash (botón atrás del navegador)
    window.addEventListener('hashchange', () => {
      const module = location.hash.replace('#', '');
      if (MODULES.includes(module) && module !== currentModule) {
        activateModule(module);
      }
    });

    // Listeners en navbar links
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(el.dataset.nav);
      });
    });

    // Listeners en sidebar items
    document.querySelectorAll('[data-module]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(el.dataset.module);
      });
    });
  }

  /* Navega a un módulo y actualiza el hash */
  function navigateTo(module, pushHash = true) {
    if (!MODULES.includes(module)) return;
    if (pushHash) history.pushState(null, '', `#${module}`);
    activateModule(module);
  }

  /* Activa el módulo en la UI */
  function activateModule(module) {
    currentModule = module;

    // Ocultar todos los módulos
    document.querySelectorAll('.module').forEach(el => {
      el.classList.remove('active');
    });

    // Mostrar módulo objetivo
    const target = document.getElementById(`module-${module}`);
    if (target) {
      target.classList.add('active');
      // Hacer scroll al inicio
      const main = document.querySelector('.main-content');
      if (main) main.scrollTop = 0;
    }

    // Actualizar estado activo en navbar
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === module);
    });

    // Actualizar estado activo en sidebar
    document.querySelectorAll('[data-module]').forEach(el => {
      el.classList.toggle('active', el.dataset.module === module);
    });

    // Emitir evento personalizado para que app.js reaccione
    window.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module } }));
  }

  /* Obtiene el módulo actual */
  function getCurrent() {
    return currentModule;
  }

  return { init, navigateTo, getCurrent };
})();
