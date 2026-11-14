/* Mi Diario — lógica de la aplicación */
(function () {
  "use strict";

  const { all, get, save, remove } = window.DiarioDB;

  const MOODS = ["😊", "🥰", "😌", "🤩", "😴", "😕", "😢", "😡"];
  const $ = (sel) => document.querySelector(sel);

  const els = {
    pages: {
      list: $("#view-list"),
      entry: $("#view-entry"),
      editor: $("#view-editor"),
    },
    entriesList: $("#entries-list"),
    reader: $("#entry-reader"),
    form: $("#editor-form"),
    date: $("#entry-date"),
    title: $("#entry-title"),
    text: $("#entry-text"),
    charCount: $("#char-count"),
    moodPicker: $("#mood-picker"),
    photoGrid: $("#photo-grid"),
    photoInput: $("#photo-input"),
    btnAddPhoto: $("#btn-add-photo"),
    btnNew: $("#btn-new"),
    btnHome: $("#btn-home"),
    btnSearch: $("#btn-search"),
    searchbar: $("#searchbar"),
    searchInput: $("#search-input"),
    appTitle: $("#app-title"),
    lightbox: $("#lightbox"),
    lightboxImg: $("#lightbox-img"),
    lightboxClose: $("#lightbox-close"),
    confirm: $("#confirm"),
    confirmText: $("#confirm-text"),
    confirmOk: $("#confirm-ok"),
    confirmCancel: $("#confirm-cancel"),
    toast: $("#toast"),
  };

  const state = {
    view: "list",
    entries: [],
    editingId: null,
    photos: [],
    mood: null,
    deletingId: null,
    animating: false,
  };

  /* ---------- Utilidades ---------- */

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function formatDate(iso) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function todayISO() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  let toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 2200);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* Reduce y comprime fotos antes de guardarlas */
  async function downscale(dataUrl, maxSide = 1280, quality = 0.82) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  /* ---------- Navegación con animación de página ---------- */

  function go(target, { flip = false, direction = "forward" } = {}) {
    if (state.animating || target === state.view) return;
    const from = els.pages[state.view];
    const to = els.pages[target];

    const outClass = flip
      ? "flip-out"
      : direction === "forward"
        ? "slide-out-left"
        : "slide-out-right";
    const inClass = flip ? "flip-in" : direction === "forward" ? "slide-in-right" : "slide-in-left";

    state.animating = true;
    from.classList.add(outClass);
    to.classList.add("active", inClass);
    to.scrollTop = 0;

    const done = () => {
      from.classList.remove("active", outClass);
      to.classList.remove(inClass);
      state.animating = false;
    };
    to.addEventListener("animationend", done, { once: true });
    setTimeout(done, 700); /* red de seguridad */

    state.view = target;
    els.btnHome.classList.toggle("hidden", target === "list");
    els.appTitle.textContent =
      target === "editor" ? (state.editingId ? "Editar" : "Nueva página") :
      target === "entry" ? "Leyendo…" : "Mi Diario";
  }

  /* ---------- Lista ---------- */

  async function refreshList() {
    state.entries = (await all()).sort((a, b) => (a.date < b.date ? 1 : -1));
    renderList();
  }

  function renderList() {
    const query = els.searchInput.value.trim().toLowerCase();
    const items = query
      ? state.entries.filter(
          (e) =>
            (e.title || "").toLowerCase().includes(query) ||
            (e.text || "").toLowerCase().includes(query)
        )
      : state.entries;

    if (!items.length) {
      els.entriesList.innerHTML = `
        <div class="empty">
          <span class="empty-icon">📖</span>
          <p>${query ? "Sin resultados para esa búsqueda" : "Tu diario está esperando su primera página…"}</p>
        </div>`;
      return;
    }

    let html = "";
    let lastMonth = "";
    items.forEach((e, i) => {
      const d = new Date(e.date + "T12:00:00");
      const month = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      if (month !== lastMonth) {
        html += `<h2 class="month-label">${month}</h2>`;
        lastMonth = month;
      }
      const thumb = e.photos && e.photos.length
        ? `<img class="entry-thumb" src="${e.photos[0]}" alt="" />`
        : `<div class="entry-thumb">${e.mood || "📝"}</div>`;
      html += `
        <div class="entry-card" data-id="${e.id}" style="animation-delay:${Math.min(i, 8) * 0.04}s">
          ${thumb}
          <div class="entry-card-body">
            <div class="entry-card-title">${escapeHtml(e.title) || "(sin título)"}</div>
            <div class="entry-card-meta"><span>${formatDate(e.date)}</span></div>
            <div class="entry-card-snippet">${escapeHtml((e.text || "").slice(0, 90))}</div>
          </div>
        </div>`;
    });
    els.entriesList.innerHTML = html;
  }

  /* ---------- Lector ---------- */

  async function openEntry(id) {
    const e = await get(id);
    if (!e) return;
    const photosHtml = (e.photos || [])
      .map((p, i) => `<div class="photo-item" data-photo="${i}"><img src="${p}" alt="Foto ${i + 1}" loading="lazy" /></div>`)
      .join("");
    const paragraphs = (e.text || "(esta página quedó en blanco)")
      .split(/\n+/)
      .filter((p) => p.trim())
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");

    els.reader.innerHTML = `
      <div class="reader-date">${formatDate(e.date)}</div>
      <h2 class="reader-title">${escapeHtml(e.title) || "(sin título)"}<span class="reader-mood">${e.mood || ""}</span></h2>
      <div class="reader-text">${paragraphs}</div>
      ${photosHtml ? `<div class="photo-grid">${photosHtml}</div>` : ""}
      <div class="reader-actions">
        <button class="btn-ghost" data-action="edit">✏️ Editar</button>
        <button class="btn-danger" data-action="delete">🗑 Borrar</button>
      </div>`;

    els.reader.dataset.id = id;
    go("entry", { flip: true });
  }

  /* ---------- Editor ---------- */

  function renderMoods() {
    els.moodPicker.innerHTML = MOODS.map(
      (m) => `<button type="button" class="mood ${state.mood === m ? "selected" : ""}" data-mood="${m}">${m}</button>`
    ).join("");
  }

  function renderPhotoGrid() {
    els.photoGrid.innerHTML = state.photos
      .map(
        (p, i) => `
        <div class="photo-item" style="animation-delay:${i * 0.06}s">
          <img src="${p}" alt="Foto ${i + 1}" />
          <button type="button" class="photo-remove" data-index="${i}" aria-label="Quitar foto">✕</button>
        </div>`
      )
      .join("");
  }

  function openEditor(entry) {
    state.editingId = entry ? entry.id : null;
    state.photos = entry ? [...(entry.photos || [])] : [];
    state.mood = entry ? entry.mood || null : null;
    els.date.value = entry ? entry.date : todayISO();
    els.title.value = entry ? entry.title || "" : "";
    els.text.value = entry ? entry.text || "" : "";
    updateCharCount();
    renderMoods();
    renderPhotoGrid();
    go("editor", { flip: !!entry });
    if (!entry) setTimeout(() => els.title.focus(), 550);
  }

  function updateCharCount() {
    const n = els.text.value.length;
    els.charCount.textContent = `${n} caracter${n === 1 ? "" : "es"}`;
    els.charCount.classList.add("bump");
    setTimeout(() => els.charCount.classList.remove("bump"), 160);
  }

  /* ---------- Eventos ---------- */

  els.btnNew.addEventListener("click", () => openEditor(null));
  els.btnHome.addEventListener("click", () => {
    state.editingId = null;
    go("list", { direction: "back" });
    refreshList();
  });

  els.btnSearch.addEventListener("click", () => {
    els.searchbar.classList.toggle("hidden");
    if (!els.searchbar.classList.contains("hidden")) els.searchInput.focus();
    else {
      els.searchInput.value = "";
      renderList();
    }
  });
  els.searchInput.addEventListener("input", renderList);

  els.entriesList.addEventListener("click", (ev) => {
    const card = ev.target.closest(".entry-card");
    if (card) openEntry(Number(card.dataset.id));
  });

  els.reader.addEventListener("click", async (ev) => {
    const photo = ev.target.closest(".photo-item");
    if (photo) {
      const entry = await get(Number(els.reader.dataset.id));
      els.lightboxImg.src = entry.photos[Number(photo.dataset.photo)];
      els.lightbox.classList.remove("hidden");
      return;
    }
    const action = ev.target.closest("[data-action]");
    if (!action) return;
    const id = Number(els.reader.dataset.id);
    if (action.dataset.action === "edit") {
      const entry = await get(id);
      openEditor(entry);
    } else if (action.dataset.action === "delete") {
      state.deletingId = id;
      els.confirm.classList.remove("hidden");
    }
  });

  els.lightboxClose.addEventListener("click", () => els.lightbox.classList.add("hidden"));
  els.lightbox.addEventListener("click", (ev) => {
    if (ev.target === els.lightbox) els.lightbox.classList.add("hidden");
  });

  els.moodPicker.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".mood");
    if (!btn) return;
    state.mood = state.mood === btn.dataset.mood ? null : btn.dataset.mood;
    renderMoods();
  });

  els.btnAddPhoto.addEventListener("click", () => els.photoInput.click());

  els.photoInput.addEventListener("change", async () => {
    const files = [...els.photoInput.files];
    els.photoInput.value = "";
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const raw = await fileToDataUrl(file);
      state.photos.push(await downscale(raw));
      renderPhotoGrid();
    }
    if (files.length) toast("Foto(s) añadida(s) 📷");
  });

  els.photoGrid.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".photo-remove");
    if (!btn) return;
    state.photos.splice(Number(btn.dataset.index), 1);
    renderPhotoGrid();
  });

  /* Efecto de escritura */
  let writeTimer = null;
  function markWriting() {
    els.form.classList.add("writing");
    clearTimeout(writeTimer);
    writeTimer = setTimeout(() => els.form.classList.remove("writing"), 1200);
  }
  els.text.addEventListener("input", () => {
    updateCharCount();
    markWriting();
  });
  els.title.addEventListener("input", markWriting);

  els.form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const btn = els.form.querySelector(".btn-save");
    btn.classList.add("saving");

    const entry = {
      date: els.date.value || todayISO(),
      title: els.title.value.trim(),
      text: els.text.value,
      mood: state.mood,
      photos: state.photos,
      updatedAt: Date.now(),
    };
    if (state.editingId) entry.id = state.editingId;

    await new Promise((r) => setTimeout(r, 450)); /* deja ver la pluma escribir */
    await save(entry);
    btn.classList.remove("saving");
    state.editingId = null;
    toast("Página guardada ✨");
    await refreshList();
    go("list", { direction: "back" });
  });

  /* Confirmación de borrado */
  els.confirmOk.addEventListener("click", async () => {
    if (state.deletingId != null) {
      await remove(state.deletingId);
      state.deletingId = null;
      els.confirm.classList.add("hidden");
      toast("Entrada borrada");
      await refreshList();
      go("list", { direction: "back" });
    }
  });
  els.confirmCancel.addEventListener("click", () => {
    state.deletingId = null;
    els.confirm.classList.add("hidden");
  });

  /* Volver con el botón atrás del móvil */
  window.addEventListener("popstate", () => {
    if (state.view !== "list" && !state.animating) go("list", { direction: "back" });
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      if (!els.lightbox.classList.contains("hidden")) els.lightbox.classList.add("hidden");
      else if (!els.confirm.classList.contains("hidden")) els.confirm.classList.add("hidden");
      else if (state.view !== "list") go("list", { direction: "back" });
    }
  });

  /* PWA: service worker + aviso de instalación */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
  });

  /* ---------- Arranque ---------- */
  renderMoods();
  refreshList();
})();
