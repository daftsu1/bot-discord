/**
 * HTML del portal web (login y dashboard).
 */
export function loginPageHtml(baseUrl) {
  const redirectUri = `${baseUrl.replace(/\/$/, '')}/portal/auth/callback`;
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0f172a">
  <title>Portal - Lista de compras</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --accent: #5865f2;
      --accent-hover: #4752c4;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --radius: 12px;
    }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 2rem;
      text-align: center;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35);
    }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
    p { color: var(--text-muted); font-size: 0.9375rem; margin: 0 0 1.5rem; line-height: 1.5; }
    .btn-discord {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      width: 100%;
      padding: 0.875rem 1.25rem;
      background: var(--accent);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9375rem;
      font-family: inherit;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .btn-discord:hover { background: var(--accent-hover); }
    .btn-discord svg { width: 22px; height: 22px; flex-shrink: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🛒 Lista de compras</h1>
    <p>Inicia sesión con Discord para ver y gestionar tus listas en un solo lugar.</p>
    <a href="${authUrl}" class="btn-discord">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
      Iniciar sesión con Discord
    </a>
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function groupListsByChannel(lists) {
  const groups = new Map();
  for (const l of lists) {
    const key = `${l.guildId}:${l.channelId}`;
    const label = `${escapeHtml(l.guildName || '')} › #${escapeHtml(l.channelName || 'canal')}`;
    if (!groups.has(key)) {
      groups.set(key, { label, guildName: l.guildName, channelName: l.channelName, items: [] });
    }
    groups.get(key).items.push(l);
  }
  return groups;
}

export function dashboardPageHtml(user, lists, baseUrl) {
  const groups = groupListsByChannel(lists);
  const listSections = groups.size === 0
    ? '<p class="empty">No tienes listas aún. Crea una desde el botón de abajo o usa el bot en Discord.</p>'
    : [...groups.entries()].map(([key, g]) => {
        const items = g.items.map(l => {
          const link = `${baseUrl.replace(/\/$/, '')}/v/${l.token}`;
          const badge = l.isOwner ? '<span class="badge owner">Tuya</span>' : '<span class="badge shared">Compartida</span>';
          return `<a href="${link}" class="list-card">
            <div class="list-info">
              <span class="list-name">${escapeHtml(l.displayName)}</span>
              ${badge}
            </div>
            <span class="list-arrow">→</span>
          </a>`;
        }).join('');
        return `<div class="channel-group">
          <h3 class="channel-label">${g.label}</h3>
          <div class="channel-lists">${items}</div>
        </div>`;
      }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0f172a">
  <title>Mis listas - Bot Despensa</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-hover: #334155;
      --border: #334155;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --radius: 12px;
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--surface);
    }
    .user-name { font-weight: 600; font-size: 1rem; }
    .btn-logout {
      padding: 0.5rem 1rem;
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--text-muted);
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      font-family: inherit;
      text-decoration: none;
    }
    .btn-logout:hover { opacity: 0.9; }
    h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
    .sub { color: var(--text-muted); font-size: 0.875rem; margin: 0 0 1.5rem; }
    .list-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: var(--surface);
      border-radius: var(--radius);
      margin-bottom: 0.5rem;
      text-decoration: none;
      color: inherit;
      transition: background 0.15s;
    }
    .list-card:hover { background: var(--surface-hover); }
    .list-info { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .list-name { font-weight: 500; font-size: 1rem; }
    .badge {
      font-size: 0.6875rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-weight: 600;
    }
    .badge.owner { background: rgba(56, 189, 248, 0.2); color: var(--accent); }
    .badge.shared { background: rgba(52, 211, 153, 0.2); color: #34d399; }
    .list-arrow { color: var(--text-muted); font-size: 1.25rem; }
    .channel-group { margin-bottom: 1.5rem; }
    .channel-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 0.5rem;
    }
    .channel-lists .list-card { margin-bottom: 0.5rem; }
    .btn-add {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.875rem;
      background: var(--accent);
      color: #0f172a;
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      font-family: inherit;
      margin-bottom: 1.5rem;
      text-decoration: none;
    }
    .btn-add:hover { opacity: 0.95; }
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
    .modal-overlay.open { opacity: 1; visibility: visible; }
    .modal {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 1.5rem;
      max-width: 360px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal h3 { margin: 0 0 1rem; font-size: 1.125rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 0.375rem;
    }
    .form-group select, .form-group input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--surface-hover);
      border-radius: 8px;
      background: var(--bg);
      color: var(--text);
      font-size: 1rem;
      font-family: inherit;
    }
    .form-row { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .form-row .btn { flex: 1; padding: 0.625rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; border: none; }
    .form-row .btn-cancel { background: transparent; color: var(--text-muted); border: 1px solid var(--text-muted); }
    .form-row .btn-submit { background: var(--accent); color: #0f172a; }
    .form-row .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .form-check { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
    .form-check input { width: auto; }
    .empty {
      color: var(--text-muted);
      padding: 2rem;
      text-align: center;
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px dashed rgba(148, 163, 184, 0.3);
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="user-info">
      <img src="${user.avatarUrl || ''}" alt="" class="user-avatar" onerror="this.style.display='none'">
      <span class="user-name">${escapeHtml(user.username || 'Usuario')}</span>
    </div>
    <a href="/portal/logout" class="btn-logout">Cerrar sesión</a>
  </header>
  <h1>Mis listas</h1>
  <p class="sub">Agrupadas por canal. Pulsa para abrir.</p>
  <button type="button" class="btn-add" id="btnNewList">+ Nueva lista</button>
  <div class="lists">${listSections}</div>

  <div class="modal-overlay" id="createModal">
    <div class="modal">
      <h3>Nueva lista</h3>
      <form id="createForm">
        <div class="form-group">
          <label for="createGuild">Servidor</label>
          <select id="createGuild" required>
            <option value="">Elige un servidor...</option>
          </select>
        </div>
        <div class="form-group">
          <label for="createChannel">Canal</label>
          <select id="createChannel" required disabled>
            <option value="">Primero elige un servidor</option>
          </select>
        </div>
        <div class="form-group">
          <label for="createName">Nombre (para listas compartidas)</label>
          <input type="text" id="createName" placeholder="ej: semanal, piso" maxlength="50" autocomplete="off">
        </div>
        <div class="form-check">
          <input type="checkbox" id="createPersonal" checked>
          <label for="createPersonal">Lista personal (solo tú)</label>
        </div>
        <div class="form-row">
          <button type="button" class="btn btn-cancel" id="btnCancelCreate">Cancelar</button>
          <button type="submit" class="btn btn-submit" id="btnSubmitCreate">Crear</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const createModal = document.getElementById('createModal');
    const createForm = document.getElementById('createForm');
    const createGuild = document.getElementById('createGuild');
    const createChannel = document.getElementById('createChannel');
    const createName = document.getElementById('createName');
    const createPersonal = document.getElementById('createPersonal');

    document.getElementById('btnNewList').onclick = () => {
      createModal.classList.add('open');
      loadGuilds();
    };
    document.getElementById('btnCancelCreate').onclick = () => createModal.classList.remove('open');
    createModal.addEventListener('click', e => { if (e.target === createModal) createModal.classList.remove('open'); });

    createPersonal.addEventListener('change', () => {
      createName.disabled = createPersonal.checked;
      if (createPersonal.checked) createName.value = '';
    });

    async function loadGuilds() {
      createGuild.innerHTML = '<option value="">Cargando...</option>';
      const r = await fetch('/api/portal/guilds', { credentials: 'include' });
      const guilds = await r.json();
      createGuild.innerHTML = '<option value="">Elige un servidor...</option>' +
        guilds.map(g => '<option value="' + g.id + '">' + (g.name || g.id) + '</option>').join('');
      createChannel.innerHTML = '<option value="">Elige primero un servidor</option>';
      createChannel.disabled = true;
    }

    createGuild.addEventListener('change', async () => {
      const guildId = createGuild.value;
      createChannel.innerHTML = '<option value="">Cargando...</option>';
      createChannel.disabled = true;
      if (!guildId) return;
      const r = await fetch('/api/portal/guilds/' + guildId + '/channels', { credentials: 'include' });
      const channels = await r.json();
      createChannel.innerHTML = '<option value="">Elige un canal...</option>' +
        channels.map(c => '<option value="' + c.id + '">#' + (c.name || c.id) + '</option>').join('');
      createChannel.disabled = false;
    });

    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isPersonal = createPersonal.checked;
      const name = isPersonal ? 'mi-lista' : (createName.value.trim() || 'nueva');
      const payload = {
        guildId: createGuild.value,
        channelId: createChannel.value,
        name,
        isPersonal
      };
      const btn = document.getElementById('btnSubmitCreate');
      btn.disabled = true;
      btn.textContent = 'Creando...';
      try {
        const r = await fetch('/api/portal/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Error');
        window.location.reload();
      } catch (err) {
        alert(err.message);
        btn.disabled = false;
        btn.textContent = 'Crear';
      }
    });
  </script>
</body>
</html>`;
}
