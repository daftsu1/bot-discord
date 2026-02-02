/**
 * HTML de la vista web de la lista (responsive, para celular).
 */
export function listPageHtml() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lista de compras</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 1rem;
      background: #1a1a2e;
      color: #eee;
      min-height: 100vh;
    }
    h1 { font-size: 1.25rem; margin: 0 0 1rem; }
    .section { margin-bottom: 1.5rem; }
    .section h2 { font-size: 0.9rem; color: #888; margin: 0 0 0.5rem; text-transform: uppercase; }
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #16213e;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    .item.done { opacity: 0.7; }
    .item.done .label { text-decoration: line-through; color: #888; }
    .label { flex: 1; }
    .label .qty { color: #888; font-size: 0.9em; }
    .btn {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      background: #0f3460;
      color: #eee;
    }
    .btn:active { opacity: 0.8; }
    .btn.done { background: #2ecc71; color: #1a1a2e; }
    .btn.undo { background: #e74c3c; }
    .empty { color: #888; padding: 1rem; }
    .error { color: #e74c3c; padding: 0.5rem 0; }
    #loading { padding: 1rem; color: #888; }
  </style>
</head>
<body>
  <h1>🛒 Lista de compras</h1>
  <div id="loading">Cargando…</div>
  <div id="content" style="display:none;">
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
  <script>
    const token = window.location.pathname.split('/').pop();
    const api = (path, opts = {}) => fetch('/api/v/' + token + path, opts);

    async function load() {
      try {
        const r = await api('/items');
        if (!r.ok) throw new Error('No se pudo cargar la lista');
        const items = await r.json();
        render(items);
      } catch (e) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').textContent = e.message;
        document.getElementById('error').style.display = 'block';
      }
    }

    function render(items) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('content').style.display = 'block';
      const pending = items.filter(i => !i.is_purchased);
      const done = items.filter(i => i.is_purchased);
      document.getElementById('pendingSection').style.display = pending.length ? 'block' : 'none';
      document.getElementById('doneSection').style.display = done.length ? 'block' : 'none';
      document.getElementById('pendingList').innerHTML = pending.length
        ? pending.map(i => itemRow(i, false)).join('')
        : '<p class="empty">Nada pendiente</p>';
      document.getElementById('doneList').innerHTML = done.length
        ? done.map(i => itemRow(i, true)).join('')
        : '<p class="empty">Ninguno comprado aún</p>';
    }

    function itemRow(item, isDone) {
      const label = item.quantity > 1
        ? item.name + ' <span class="qty">x' + item.quantity + '</span>'
        : item.name;
      const cat = item.category ? ' <span class="qty">[' + escapeHtml(item.category) + ']</span>' : '';
      if (isDone) {
        return '<div class="item done" data-name="' + escapeHtml(item.name) + '">' +
          '<span class="label">' + escapeHtml(item.name) + (item.quantity > 1 ? ' x' + item.quantity : '') + cat + '</span>' +
          '<button class="btn undo" type="button">Desmarcar</button></div>';
      }
      return '<div class="item" data-name="' + escapeHtml(item.name) + '">' +
        '<span class="label">' + escapeHtml(item.name) + (item.quantity > 1 ? ' x' + item.quantity : '') + cat + '</span>' +
        '<button class="btn done" type="button">Marcar comprado</button></div>';
    }

    function escapeHtml(s) {
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }

    document.body.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const item = btn.closest('.item');
      const name = item && item.dataset.name;
      if (!name) return;
      const isUndo = btn.classList.contains('undo');
      try {
        const r = await api(isUndo ? '/items/unmark' : '/items/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemName: name })
        });
        if (!r.ok) throw new Error(await r.text());
        load();
      } catch (err) {
        document.getElementById('error').textContent = err.message;
        document.getElementById('error').style.display = 'block';
      }
    });

    load();
  </script>
</body>
</html>`;
}
