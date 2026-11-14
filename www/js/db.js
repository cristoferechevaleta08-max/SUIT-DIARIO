/* Capa de datos: IndexedDB local (funciona offline).
   Preparada para sincronizar con un servidor en el futuro. */
(function () {
  "use strict";

  const DB_NAME = "mi-diario";
  const DB_VERSION = 1;
  const STORE = "entries";

  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
          store.createIndex("date", "date");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  const DB = {
    async all() {
      const db = await open();
      return new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async get(id) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    },

    async save(entry) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, "readwrite");
        const store = t.objectStore(STORE);
        let req;
        if (entry.id) req = store.put(entry);
        else req = store.add(entry);
        req.onsuccess = () => resolve(req.result);
        t.onerror = () => reject(t.error);
      });
    },

    async remove(id) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, "readwrite");
        t.objectStore(STORE).delete(id);
        t.oncomplete = () => resolve(true);
        t.onerror = () => reject(t.error);
      });
    },
  };

  window.DiarioDB = DB;
})();
