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
    .item-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .empty {
      color: var(--text-muted);
      padding: 1.25rem;
      text-align: center;
      font-size: 0.9375rem;
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px dashed rgba(148, 163, 184, 0.3);
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
  </style>
</head>
<body>
  <header class="header">
    <h1>🛒 Lista de compras</h1>
    <p class="sub">Bot Despensa</p>
  </header>
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
      const qtyPart = item.unit
        ? ' <span class="qty">· ' + item.quantity + ' ' + escapeHtml(item.unit) + '</span>'
        : (item.quantity > 1 ? ' <span class="qty">x' + item.quantity + '</span>' : '');
      const cat = item.category ? ' <span class="cat">' + escapeHtml(item.category) + '</span>' : '';
      const removeBtn = '<button class="btn remove" type="button" title="Quitar de la lista">Quitar</button>';
      if (isDone) {
        return '<div class="item done" data-name="' + escapeHtml(item.name) + '">' +
          '<span class="label">' + escapeHtml(item.name) + qtyPart + cat + '</span>' +
          '<div class="item-actions">' + removeBtn + '<button class="btn undo" type="button">Desmarcar</button></div></div>';
      }
      return '<div class="item" data-name="' + escapeHtml(item.name) + '">' +
        '<span class="label">' + escapeHtml(item.name) + qtyPart + cat + '</span>' +
        '<div class="item-actions">' + removeBtn + '<button class="btn done" type="button">✓ Marcar comprado</button></div></div>';
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
      let path = '/items/mark';
      if (btn.classList.contains('undo')) path = '/items/unmark';
      if (btn.classList.contains('remove')) path = '/items/remove';
      try {
        const r = await api(path, {
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
