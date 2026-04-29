/* ============================================================
   AlexOS PDFStore — Almacenamiento de PDFs con IndexedDB
   ============================================================ */
const PDFStore = (() => {
  const DB_NAME = 'alexos_pdfs';
  const STORE   = 'pdfs';
  let db = null;

  function open() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror   = () => reject(req.error);
    });
  }

  async function save(id, arrayBuffer) {
    const d = await open();
    return new Promise((resolve, reject) => {
      const tx  = d.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).put({ id, data: arrayBuffer });
      req.onsuccess = resolve;
      req.onerror   = () => reject(req.error);
    });
  }

  async function getBlob(id) {
    const d = await open();
    return new Promise((resolve, reject) => {
      const tx  = d.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(
        req.result ? new Blob([req.result.data], { type: 'application/pdf' }) : null
      );
      req.onerror = () => reject(req.error);
    });
  }

  async function remove(id) {
    const d = await open();
    return new Promise((resolve, reject) => {
      const tx  = d.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).delete(id);
      req.onsuccess = resolve;
      req.onerror   = () => reject(req.error);
    });
  }

  async function has(id) {
    const d = await open();
    return new Promise((resolve, reject) => {
      const tx  = d.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).count(id);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror   = () => reject(req.error);
    });
  }

  return { save, getBlob, remove, has };
})();
