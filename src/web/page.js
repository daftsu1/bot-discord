/**
 * HTML de la vista web de la lista (responsive, para celular).
 */
export function listPageHtml() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0f172a">
  <title>Lista de compras</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-hover: #334155;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --success: #34d399;
      --danger: #f87171;
      --radius: 12px;
      --shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.15);
    }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 1.25rem;
      padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      text-align: center;
      margin-bottom: 1.75rem;
      padding-top: env(safe-area-inset-top);
    }
    .header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .header .sub {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .section {
      margin-bottom: 1.75rem;
    }
    .section h2 {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      margin: 0 0 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--text-muted) 0%, transparent 100%);
      opacity: 0.4;
    }
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 1rem 1rem;
      background: var(--surface);
      border-radius: var(--radius);
      margin-bottom: 0.5rem;
      box-shadow: var(--shadow);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .item:active { transform: scale(0.99); }
    .item.done {
      opacity: 0.75;
      background: rgba(30, 41, 59, 0.6);
    }
    .item.done .label { text-decoration: line-through; color: var(--text-muted); }
    .label {
      flex: 1;
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.4;
    }
    .label .qty { color: var(--text-muted); font-size: 0.9em; font-weight: 400; }
    .label .cat { color: var(--accent); font-size: 0.85em; font-weight: 400; }
    .label .price { color: var(--success); font-size: 0.9em; font-weight: 500; margin-left: 0.25rem; }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 10px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: transform 0.1s ease, opacity 0.15s ease;
      flex-shrink: 0;
    }
    .btn:active { transform: scale(0.96); }
    .btn.done {
      background: var(--success);
      color: #0f172a;
    }
    .btn.undo {
      background: var(--danger);
      color: #fff;
    }
    .btn.remove {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--text-muted);
    }
    .btn.remove:hover { opacity: 0.9; }
    .btn.edit {
      background: transparent;
      color: var(--accent);
      border: 1px solid var(--accent);
    }
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .filter-bar select {
      flex: 1;
      max-width: 200px;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--surface-hover);
      border-radius: 8px;
      background: var(--bg);
      color: var(--text);
      font-size: 0.875rem;
      font-family: inherit;
    }
    .filter-bar select:focus {
      outline: none;
      border-color: var(--accent);
    }
    .btn.add {
      background: var(--accent);
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    .btn.add:hover { opacity: 0.95; }
    .item-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }
    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }
    .modal {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 1.5rem;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
      transform: scale(0.95);
      transition: transform 0.2s;
    }
    .modal-overlay.open .modal {
      transform: scale(1);
    }
    .modal h3 { margin: 0 0 1rem; font-size: 1.125rem; }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 0.375rem;
    }
    .form-group input, .form-group select {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--surface-hover);
      border-radius: 8px;
      background: var(--bg);
      color: var(--text);
      font-size: 1rem;
      font-family: inherit;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    .modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .modal-actions .btn { flex: 1; }
    .category-group {
      margin-bottom: 1rem;
    }
    .category-group:last-child { margin-bottom: 0; }
    .category-group .group-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.5rem;
      padding-left: 0.25rem;
    }
    .empty {
      color: var(--text-muted);
      padding: 1.25rem;
      text-align: center;
      font-size: 0.9375rem;
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px dashed rgba(148, 163, 184, 0.3);
    }
    .total-price {
      margin: 0.75rem 0 0;
      padding: 0.75rem 1rem;
      background: var(--surface);
      border-radius: var(--radius);
      font-weight: 600;
      color: var(--success);
      text-align: right;
    }
    .error {
      color: var(--danger);
      padding: 1rem;
      background: rgba(248, 113, 113, 0.1);
      border-radius: var(--radius);
      font-size: 0.9375rem;
    }
    #loading {
      padding: 2rem;
      color: var(--text-muted);
      text-align: center;
      font-size: 0.9375rem;
    }
    #loading::after {
      content: '';
      display: inline-block;
      width: 1em;
      height: 1em;
      margin-left: 0.5rem;
      border: 2px solid var(--text-muted);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      vertical-align: -0.2em;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fbbf24;
      color: #1f2937;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-align: center;
      z-index: 999;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .offline-banner.show {
      transform: translateY(0);
    }
    .offline-banner.syncing {
      background: var(--accent);
      color: #0f172a;
    }
  </style>
</head>
<body>
  <div class="offline-banner" id="offlineBanner" role="status">
    Sin conexión — Los cambios se guardarán al recuperar el internet
  </div>
  <header class="header">
    <h1>🛒 Lista de compras</h1>
    <p class="sub">Bot Despensa · <a href="/portal" style="color:var(--accent);text-decoration:none;">Ver todas mis listas</a></p>
  </header>
  <div id="loading">Cargando…</div>
  <div id="content" style="display:none;">
    <button type="button" class="btn add" id="btnAdd">+ Agregar producto</button>
    <div class="filter-bar">
      <label for="categoryFilter" style="font-size:0.8125rem;color:var(--text-muted);">Ver:</label>
      <select id="categoryFilter">
        <option value="">Todas</option>
      </select>
    </div>
    <div class="section" id="pendingSection">
      <h2>Por comprar</h2>
      <div id="pendingList"></div>
    </div>
    <div class="section" id="doneSection">
      <h2>Comprados</h2>
      <div id="doneList"></div>
    </div>
  </div>
  <p id="error" class="error" style="display:none;"></p>

  <div class="modal-overlay" id="markModal">
    <div class="modal">
      <h3>Marcar como comprado</h3>
      <p class="mark-item-name" id="markItemName"></p>
      <form id="markForm">
        <div class="form-group">
          <label for="markPrice">Precio (opcional)</label>
          <input type="number" id="markPrice" name="price" placeholder="ej: 1500" min="0" step="0.01" autocomplete="off">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn remove" id="btnCancelMark">Cancelar</button>
          <button type="submit" class="btn done">Marcar</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="addModal">
    <div class="modal">
      <h3>Agregar producto</h3>
      <form id="addForm">
        <div class="form-group">
          <label for="addName">Producto *</label>
          <input type="text" id="addName" name="name" placeholder="ej: Leche, Pan..." required maxlength="100" autocomplete="off">
        </div>
        <div class="form-group">
          <label for="addQuantity">Cantidad</label>
          <input type="number" id="addQuantity" name="quantity" min="1" max="9999" value="1">
        </div>
        <div class="form-group">
          <label for="addCategory">Categoría (opcional)</label>
          <input type="text" id="addCategory" name="category" list="categorySuggestions" placeholder="ej: supermercado, carnicería" maxlength="50" autocomplete="off">
          <datalist id="categorySuggestions"></datalist>
        </div>
        <div class="form-group">
          <label for="addUnit">Unidad (opcional)</label>
          <select id="addUnit" name="unit">
            <option value="">—</option>
            <option value="L">Litros</option>
            <option value="ml">Mililitros</option>
            <option value="kg">Kilogramos</option>
            <option value="g">Gramos</option>
            <option value="un">Unidades</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn remove" id="btnCancel">Cancelar</button>
          <button type="submit" class="btn done">Agregar</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="editModal">
    <div class="modal">
      <h3>Editar producto</h3>
      <form id="editForm">
        <input type="hidden" id="editItemName" name="itemName">
        <div class="form-group">
          <label for="editName">Producto *</label>
          <input type="text" id="editName" name="name" required maxlength="100" autocomplete="off">
        </div>
        <div class="form-group">
          <label for="editQuantity">Cantidad</label>
          <input type="number" id="editQuantity" name="quantity" min="1" max="9999">
        </div>
        <div class="form-group">
          <label for="editCategory">Categoría (opcional)</label>
          <input type="text" id="editCategory" name="category" list="categorySuggestions" placeholder="ej: supermercado, carnicería" maxlength="50" autocomplete="off">
        </div>
        <div class="form-group">
          <label for="editUnit">Unidad (opcional)</label>
          <select id="editUnit" name="unit">
            <option value="">—</option>
            <option value="L">Litros</option>
            <option value="ml">Mililitros</option>
            <option value="kg">Kilogramos</option>
            <option value="g">Gramos</option>
            <option value="un">Unidades</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn remove" id="btnCancelEdit">Cancelar</button>
          <button type="submit" class="btn done">Guardar</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const token = window.location.pathname.split('/').pop();
    const CACHE_KEY = 'despensa_cache_' + token;
    const QUEUE_KEY = 'despensa_queue_' + token;
    const FILTER_KEY = 'despensa_filter_' + token;
    let localItems = null;
    let currentFilter = localStorage.getItem(FILTER_KEY) || '';

    const api = (path, opts = {}) => fetch('/api/v/' + token + path, opts);

    function isConnectionSlow() {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!conn) return false;
      if (conn.saveData) return true;
      if (conn.effectiveType && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g')) return true;
      if (conn.downlink != null && conn.downlink < 1) return true;
      if (conn.rtt != null && conn.rtt > 500) return true;
      return false;
    }

    function getQueue() {
      try {
        return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      } catch (_) { return []; }
    }
    function setQueue(q) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    }
    function addToQueue(action) {
      const q = getQueue();
      q.push({ ...action, id: Date.now() + Math.random() });
      setQueue(q);
    }
    function getCachedItems() {
      try {
        return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      } catch (_) { return null; }
    }
    function setCachedItems(items) {
      if (items) localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    }

    function getUniqueCategories(items) {
      const cats = new Set();
      for (const i of (items || [])) {
        const c = (i.category || '').trim();
        if (c) cats.add(c);
      }
      return Array.from(cats).sort((a, b) => a.localeCompare(b, 'es'));
    }

    function getAllCategoriesForFilter(items) {
      const cats = new Set();
      for (const i of (items || [])) {
        cats.add((i.category || '').trim() || 'Sin categoría');
      }
      return Array.from(cats).sort((a, b) => {
        if (a === 'Sin categoría') return 1;
        if (b === 'Sin categoría') return -1;
        return a.localeCompare(b, 'es');
      });
    }

    function updateCategorySuggestions() {
      const cats = getUniqueCategories(localItems || []);
      const dl = document.getElementById('categorySuggestions');
      dl.innerHTML = cats.map(c => '<option value="' + escapeHtml(c) + '">').join('');
    }

    function filterItems(items, filter) {
      if (!filter) return items;
      return items.filter(i => {
        const cat = (i.category || '').trim() || 'Sin categoría';
        return cat === filter;
      });
    }

    function updateOfflineBanner() {
      const banner = document.getElementById('offlineBanner');
      if (navigator.onLine) {
        const q = getQueue();
        if (q.length > 0) {
          banner.textContent = 'Sincronizando ' + q.length + ' cambio(s)...';
          banner.classList.add('show', 'syncing');
        } else {
          banner.classList.remove('show', 'syncing');
        }
      } else {
        banner.textContent = 'Sin conexión — Los cambios se guardarán al recuperar el internet';
        banner.classList.add('show');
        banner.classList.remove('syncing');
      }
    }

    function applyLocalAction(type, payload, items) {
      const list = (items || localItems || []).map(i => ({ ...i }));
      if (type === 'mark') {
        const it = list.find(i => i.name.toLowerCase() === (payload.itemName || '').toLowerCase());
        if (it) { it.is_purchased = 1; it.purchased_at = new Date().toISOString(); it.price = payload.price ?? null; }
      } else if (type === 'unmark') {
        const it = list.find(i => i.name.toLowerCase() === (payload.itemName || '').toLowerCase());
        if (it) { it.is_purchased = 0; it.purchased_at = null; it.purchased_by = null; }
      } else if (type === 'remove') {
        const idx = list.findIndex(i => i.name.toLowerCase() === (payload.itemName || '').toLowerCase());
        if (idx >= 0) list.splice(idx, 1);
      } else if (type === 'update' && payload.itemName) {
        const it = list.find(i => i.name.toLowerCase() === (payload.itemName || '').toLowerCase());
        if (it) {
          if (payload.name !== undefined) it.name = (payload.name || '').trim();
          if (payload.quantity !== undefined) it.quantity = payload.quantity;
          if (payload.category !== undefined) it.category = payload.category;
          if (payload.unit !== undefined) it.unit = payload.unit;
        }
      } else if (type === 'add' && payload.name) {
        const n = (payload.name || '').trim().toLowerCase();
        const existing = list.find(i => i.name.toLowerCase() === n);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + (payload.quantity || 1);
        } else {
          list.push({
            id: 'local-' + Date.now(),
            name: (payload.name || '').trim(),
            quantity: payload.quantity || 1,
            category: payload.category || null,
            unit: payload.unit || null,
            is_purchased: 0
          });
        }
      }
      return list;
    }

    async function load() {
      const cached = getCachedItems();
      const preferCache = isConnectionSlow() && cached && cached.length >= 0;

      if (preferCache) {
        localItems = cached;
        render(cached);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        document.getElementById('error').style.display = 'none';
      }

      try {
        const r = await api('/items');
        if (!r.ok) throw new Error('No se pudo cargar la lista');
        const items = await r.json();
        localItems = items;
        setCachedItems(items);
        render(items);
        document.getElementById('error').style.display = 'none';
      } catch (e) {
        if (!preferCache) {
          document.getElementById('loading').style.display = 'none';
          if (!navigator.onLine && cached) {
            localItems = cached || [];
            render(localItems);
            document.getElementById('content').style.display = 'block';
            document.getElementById('error').style.display = 'none';
          } else if (!navigator.onLine) {
            localItems = [];
            render([]);
            document.getElementById('content').style.display = 'block';
            document.getElementById('error').style.display = 'none';
          } else {
            document.getElementById('error').textContent = e.message;
            document.getElementById('error').style.display = 'block';
          }
        }
      }
      updateOfflineBanner();
    }

    function groupByCategory(items) {
      const groups = {};
      for (const i of items) {
        const cat = (i.category || '').trim() || 'Sin categoría';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(i);
      }
      const order = Object.keys(groups).sort((a, b) => {
        if (a === 'Sin categoría') return 1;
        if (b === 'Sin categoría') return -1;
        return a.localeCompare(b, 'es');
      });
      return order.map(cat => ({ label: cat, items: groups[cat] }));
    }

    function renderGroupedHtml(items, isDone) {
      const groups = groupByCategory(items);
      return groups.map(g => 
        '<div class="category-group">' +
        '<div class="group-label">' + escapeHtml(g.label) + '</div>' +
        g.items.map(i => itemRow(i, isDone, false)).join('') +
        '</div>'
      ).join('');
    }

    function render(items) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('content').style.display = 'block';
      const allCategories = getAllCategoriesForFilter(items);
      const filterSelect = document.getElementById('categoryFilter');
      filterSelect.innerHTML = '<option value="">Todas</option>' + allCategories.map(c =>
        '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>'
      ).join('');
      if (!currentFilter || !allCategories.includes(currentFilter)) currentFilter = '';
      filterSelect.value = currentFilter;

      const pending = filterItems(items.filter(i => !i.is_purchased), currentFilter);
      const done = filterItems(items.filter(i => i.is_purchased), currentFilter);
      const totalPrice = done.reduce((sum, i) => sum + (i.price != null ? Number(i.price) * (i.quantity || 1) : 0), 0);
      document.getElementById('pendingSection').style.display = pending.length ? 'block' : 'none';
      document.getElementById('doneSection').style.display = done.length ? 'block' : 'none';
      document.getElementById('pendingList').innerHTML = pending.length
        ? renderGroupedHtml(pending, false)
        : '<p class="empty">' + (currentFilter ? 'Nada pendiente en esta categoría' : 'Nada pendiente') + '</p>';
      const doneHtml = done.length
        ? renderGroupedHtml(done, true) +
          (totalPrice > 0 ? '<p class="total-price">Total: ' + formatPrice(totalPrice) + '</p>' : '')
        : '<p class="empty">' + (currentFilter ? 'Ninguno comprado en esta categoría' : 'Ninguno comprado aún') + '</p>';
      document.getElementById('doneList').innerHTML = doneHtml;
    }

    function formatPrice(p) {
      if (p == null || p === '' || isNaN(Number(p))) return '';
      const n = Number(p);
      return '$' + n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    function itemRow(item, isDone, showCategory) {
      if (showCategory === undefined) showCategory = true;
      const qtyPart = item.unit
        ? ' <span class="qty">· ' + item.quantity + ' ' + escapeHtml(item.unit) + '</span>'
        : (item.quantity > 1 ? ' <span class="qty">x' + item.quantity + '</span>' : '');
      const cat = showCategory && item.category ? ' <span class="cat">' + escapeHtml(item.category) + '</span>' : '';
      const pricePart = isDone && item.price != null ? ' <span class="price">' + formatPrice(item.price) + '</span>' : '';
      const removeBtn = '<button class="btn remove" type="button" title="Quitar de la lista">Quitar</button>';
      const editBtn = '<button class="btn edit edit-btn" type="button" title="Editar">Editar</button>';
      if (isDone) {
        return '<div class="item done" data-name="' + escapeHtml(item.name) + '">' +
          '<span class="label">' + escapeHtml(item.name) + qtyPart + cat + pricePart + '</span>' +
          '<div class="item-actions">' + editBtn + removeBtn + '<button class="btn undo" type="button">Desmarcar</button></div></div>';
      }
      return '<div class="item" data-name="' + escapeHtml(item.name) + '">' +
        '<span class="label">' + escapeHtml(item.name) + qtyPart + cat + '</span>' +
        '<div class="item-actions">' + editBtn + removeBtn + '<button class="btn done mark-btn" type="button">✓ Marcar comprado</button></div></div>';
    }

    function escapeHtml(s) {
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }

    async function doAction(path, body, localType, localPayload, method) {
      if (navigator.onLine) {
        try {
          const r = await api(path, {
            method: method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!r.ok) {
            const txt = await r.text();
            try { throw new Error(JSON.parse(txt).error || txt); } catch (_) { throw new Error(txt); }
          }
          load();
        } catch (err) {
          document.getElementById('error').textContent = err.message;
          document.getElementById('error').style.display = 'block';
          updateOfflineBanner();
        }
      } else {
        localItems = applyLocalAction(localType, localPayload);
        setCachedItems(localItems);
        render(localItems);
        addToQueue({ type: localType, path, body, method: method || 'POST' });
        updateOfflineBanner();
      }
    }

    let pendingMarkName = null;

    document.body.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'btnAdd') {
        updateCategorySuggestions();
        document.getElementById('addModal').classList.add('open');
        document.getElementById('addName').focus();
        return;
      }
      if (btn.id === 'btnCancelEdit') {
        document.getElementById('editModal').classList.remove('open');
        return;
      }
      if (btn.classList.contains('edit-btn')) {
        const item = (localItems || []).find(i => i.name === name);
        if (item) {
          document.getElementById('editItemName').value = item.name;
          document.getElementById('editName').value = item.name;
          document.getElementById('editQuantity').value = item.quantity || 1;
          document.getElementById('editCategory').value = item.category || '';
          document.getElementById('editUnit').value = item.unit || '';
          updateCategorySuggestions();
          document.getElementById('editModal').classList.add('open');
          document.getElementById('editName').focus();
        }
        return;
      }
      if (btn.id === 'btnCancel') {
        document.getElementById('addModal').classList.remove('open');
        return;
      }
      if (btn.id === 'btnCancelMark') {
        document.getElementById('markModal').classList.remove('open');
        pendingMarkName = null;
        return;
      }
      const item = btn.closest('.item');
      const name = item && item.dataset.name;
      if (!name) return;
      if (btn.classList.contains('mark-btn')) {
        pendingMarkName = name;
        document.getElementById('markItemName').textContent = name;
        document.getElementById('markPrice').value = '';
        document.getElementById('markModal').classList.add('open');
        document.getElementById('markPrice').focus();
        return;
      }
      let path = '/items/mark', type = 'mark', method = 'POST';
      if (btn.classList.contains('undo')) { path = '/items/unmark'; type = 'unmark'; }
      if (btn.classList.contains('remove')) { path = '/items/remove'; type = 'remove'; }
      const body = { itemName: name };
      await doAction(path, body, type, { itemName: name }, method);
    });

    document.getElementById('markForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = pendingMarkName;
      if (!name) return;
      const priceVal = document.getElementById('markPrice').value.trim();
      const price = priceVal ? parseFloat(priceVal.replace(',', '.')) : null;
      document.getElementById('markModal').classList.remove('open');
      pendingMarkName = null;
      const body = { itemName: name };
      if (price != null && !isNaN(price) && price >= 0) body.price = price;
      await doAction('/items/mark', body, 'mark', { itemName: name, price: body.price ?? null });
    });

    document.getElementById('addModal').addEventListener('click', (e) => {
      if (e.target.id === 'addModal') document.getElementById('addModal').classList.remove('open');
    });
    document.getElementById('markModal').addEventListener('click', (e) => {
      if (e.target.id === 'markModal') {
        document.getElementById('markModal').classList.remove('open');
        pendingMarkName = null;
      }
    });
    document.getElementById('editModal').addEventListener('click', (e) => {
      if (e.target.id === 'editModal') document.getElementById('editModal').classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('addModal').classList.remove('open');
        document.getElementById('markModal').classList.remove('open');
        document.getElementById('editModal').classList.remove('open');
        pendingMarkName = null;
      }
    });

    document.getElementById('categoryFilter').addEventListener('change', (e) => {
      currentFilter = e.target.value || '';
      localStorage.setItem(FILTER_KEY, currentFilter);
      render(localItems || []);
    });

    document.getElementById('editForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const itemName = document.getElementById('editItemName').value.trim();
      const name = document.getElementById('editName').value.trim();
      const quantity = parseInt(document.getElementById('editQuantity').value, 10) || 1;
      const category = document.getElementById('editCategory').value.trim() || null;
      const unit = document.getElementById('editUnit').value || null;
      if (!itemName || !name) return;
      document.getElementById('editModal').classList.remove('open');
      const body = { itemName, name, quantity, category: category || undefined, unit: unit || undefined };
      const payload = { itemName, name, quantity, category, unit };

      if (navigator.onLine) {
        try {
          const r = await api('/items', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || 'Error al actualizar');
          document.getElementById('error').style.display = 'none';
          load();
        } catch (err) {
          document.getElementById('error').textContent = err.message;
          document.getElementById('error').style.display = 'block';
        }
      } else {
        localItems = applyLocalAction('update', payload);
        setCachedItems(localItems);
        render(localItems);
        addToQueue({ type: 'update', path: '/items', body, method: 'PATCH' });
        document.getElementById('error').style.display = 'none';
        updateOfflineBanner();
      }
    });

    document.getElementById('addForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('addName').value.trim();
      const quantity = parseInt(document.getElementById('addQuantity').value, 10) || 1;
      const category = document.getElementById('addCategory').value.trim() || null;
      const unit = document.getElementById('addUnit').value || null;
      if (!name) return;
      const body = { name, quantity, category: category || undefined, unit: unit || undefined };
      const payload = { name, quantity, category, unit };

      if (navigator.onLine) {
        try {
          const r = await api('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || 'Error al agregar');
          document.getElementById('addModal').classList.remove('open');
          document.getElementById('addForm').reset();
          document.getElementById('addQuantity').value = 1;
          document.getElementById('error').style.display = 'none';
          load();
        } catch (err) {
          document.getElementById('error').textContent = err.message;
          document.getElementById('error').style.display = 'block';
        }
      } else {
        localItems = applyLocalAction('add', payload);
        setCachedItems(localItems);
        render(localItems);
        addToQueue({ type: 'add', path: '/items', body });
        document.getElementById('addModal').classList.remove('open');
        document.getElementById('addForm').reset();
        document.getElementById('addQuantity').value = 1;
        document.getElementById('error').style.display = 'none';
        updateOfflineBanner();
      }
    });

    async function syncQueue() {
      const q = getQueue();
      if (q.length === 0) { updateOfflineBanner(); return; }
      updateOfflineBanner();
      const remaining = [];
      for (const a of q) {
        try {
          const r = await api(a.path, {
            method: a.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(a.body)
          });
          if (!r.ok) remaining.push(a);
        } catch (_) { remaining.push(a); }
      }
      setQueue(remaining);
      await load();
      updateOfflineBanner();
    }

    window.addEventListener('online', syncQueue);
    window.addEventListener('offline', updateOfflineBanner);

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) conn.addEventListener('change', () => { if (!isConnectionSlow()) load(); });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    load();
  </script>
</body>
</html>`;
}
