import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { config } from '../config/index.js';
import { channelTokenRepository } from '../database/repositories/channelTokenRepository.js';
import { listTokenRepository } from '../database/repositories/listTokenRepository.js';
import { listRepository } from '../database/repositories/listRepository.js';
import { userListPreferenceRepository } from '../database/repositories/userListPreferenceRepository.js';
import { shoppingRepository } from '../database/repositories/shoppingRepository.js';
import { userListsRepository } from '../database/repositories/userListsRepository.js';
import { getListDisplayName } from '../services/listService.js';
import { validateProductName, validateQuantity, validateCategory, validateUnit } from '../validation/index.js';
import { listPageHtml } from './page.js';
import { loginPageHtml, dashboardPageHtml } from './portalPage.js';
import { parseSession, setSessionCookie, clearSessionCookie } from './auth.js';
import { fetchGuilds, fetchChannels, enrichListsWithChannelInfo } from './discordApi.js';

const WEB_USER_ID = 'web';

/** Resuelve token a list_id: primero list_tokens, luego channel_tokens -> lista "general". */
function resolveTokenToListId(token) {
  const listRow = listTokenRepository.getByToken(token);
  if (listRow) return listRow.list_id;
  const channelRow = channelTokenRepository.getByToken(token);
  if (!channelRow) return null;
  const list = listRepository.getByChannelAndName(channelRow.guild_id, channelRow.channel_id, 'general');
  return list ? list.id : null;
}

export function createWebServer() {
  const app = express();
  app.use(express.json());

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(readFileSync(path.join(__dirname, 'sw.js'), 'utf8'));
  });

  /** Resuelve token a list_id y lo pone en req.listContext. */
  function resolveList(req, res, next) {
    const token = req.params.token;
    if (!token) {
      return res.status(400).send('Token requerido');
    }
    const listId = resolveTokenToListId(token);
    if (!listId) {
      return res.status(404).send('Enlace no válido o expirado');
    }
    req.listContext = { listId };
    next();
  }

  /** Página de la lista (para abrir en el celular). */
  app.get('/v/:token', (req, res) => {
    const listId = resolveTokenToListId(req.params.token);
    if (!listId) {
      return res.status(404).send('Enlace no válido o expirado');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(listPageHtml());
  });

  /** API: lista de ítems de la lista. */
  app.get('/api/v/:token/items', resolveList, (req, res) => {
    try {
      const { listId } = req.listContext;
      const items = shoppingRepository.getItems(listId, { includePurchased: true });
      res.json(items);
    } catch (err) {
      console.error('[Web] GET items:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /** API: agregar ítem a la lista. */
  app.post('/api/v/:token/items', resolveList, (req, res) => {
    try {
      const { listId } = req.listContext;
      const { name, quantity = 1, category, unit } = req.body || {};
      const validName = validateProductName(name);
      const validQuantity = validateQuantity(quantity);
      const validCategory = validateCategory(category);
      const validUnit = validateUnit(unit);
      const item = shoppingRepository.addItem(listId, validName, validQuantity, validCategory, validUnit);
      res.json({ ok: true, item });
    } catch (err) {
      if (err.message?.includes('obligatorio') || err.message?.includes('no puede')) {
        return res.status(400).json({ error: err.message });
      }
      console.error('[Web] POST add item:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /** API: marcar ítem como comprado. */
  app.post('/api/v/:token/items/mark', resolveList, (req, res) => {
    try {
      const { listId } = req.listContext;
      const { itemName } = req.body || {};
      if (!itemName || typeof itemName !== 'string') {
        return res.status(400).json({ error: 'itemName requerido' });
      }
      const result = shoppingRepository.markAsPurchased(listId, itemName.trim(), WEB_USER_ID);
      if (!result) {
        return res.status(404).json({ error: 'No se encontró el producto en la lista' });
      }
      res.json({ ok: true, item: result });
    } catch (err) {
      console.error('[Web] POST mark:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /** API: desmarcar ítem (vuelve a pendiente). */
  app.post('/api/v/:token/items/unmark', resolveList, (req, res) => {
    try {
      const { listId } = req.listContext;
      const { itemName } = req.body || {};
      if (!itemName || typeof itemName !== 'string') {
        return res.status(400).json({ error: 'itemName requerido' });
      }
      const result = shoppingRepository.unmarkAsPurchased(listId, itemName.trim());
      if (!result) {
        return res.status(404).json({ error: 'No se encontró el producto en la lista' });
      }
      res.json({ ok: true, item: result });
    } catch (err) {
      console.error('[Web] POST unmark:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /** API: quitar ítem de la lista. */
  app.post('/api/v/:token/items/remove', resolveList, (req, res) => {
    try {
      const { listId } = req.listContext;
      const { itemName } = req.body || {};
      if (!itemName || typeof itemName !== 'string') {
        return res.status(400).json({ error: 'itemName requerido' });
      }
      const result = shoppingRepository.removeItem(listId, itemName.trim());
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'No se encontró el producto en la lista' });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('[Web] POST remove:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /** ---- Portal con login Discord ---- */
  const baseUrl = config.web.baseUrl.replace(/\/$/, '');
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  app.get('/portal', (req, res) => {
    const session = parseSession(req);
    if (session) {
      return res.redirect('/portal/dashboard');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(loginPageHtml(baseUrl));
  });

  app.get('/portal/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code || !clientId || !clientSecret) {
      return res.redirect('/portal?error=config');
    }
    try {
      const redirectUri = `${baseUrl}/portal/auth/callback`;
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        console.error('[Web] OAuth token error:', tokenData);
        return res.redirect('/portal?error=token');
      }
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();
      if (userData.id) {
        const avatarUrl = userData.avatar
          ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=64`
          : null;
        setSessionCookie(res, {
          userId: userData.id,
          username: userData.global_name || userData.username || 'Usuario',
          avatarUrl
        });
      }
      res.redirect('/portal/dashboard');
    } catch (err) {
      console.error('[Web] OAuth callback error:', err);
      res.redirect('/portal?error=callback');
    }
  });

  function requirePortalSession(req, res, next) {
    const session = parseSession(req);
    if (!session) {
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      return res.redirect('/portal');
    }
    req.portalSession = session;
    next();
  }

  app.get('/portal/dashboard', requirePortalSession, async (req, res) => {
    const { portalSession } = req;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(dashboardPageHtml(baseUrl));
  });

  app.get('/api/portal/lists', requirePortalSession, async (req, res) => {
    try {
      const { portalSession } = req;
      const lists = userListsRepository.getListsForUser(portalSession.userId);
      const enriched = await enrichListsWithChannelInfo(lists);
      res.json({
        user: { username: portalSession.username, avatarUrl: portalSession.avatarUrl },
        lists: enriched
      });
    } catch (err) {
      console.error('[Web] GET portal lists:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/portal/guilds', requirePortalSession, async (req, res) => {
    try {
      const guilds = await fetchGuilds();
      res.json(guilds);
    } catch (err) {
      console.error('[Web] fetchGuilds:', err);
      res.status(500).json({ error: 'Error al obtener servidores' });
    }
  });

  app.get('/api/portal/guilds/:guildId/channels', requirePortalSession, async (req, res) => {
    try {
      const channels = await fetchChannels(req.params.guildId);
      res.json(channels);
    } catch (err) {
      console.error('[Web] fetchChannels:', err);
      res.status(500).json({ error: 'Error al obtener canales' });
    }
  });

  app.post('/api/portal/lists', requirePortalSession, (req, res) => {
    try {
      const { guildId, channelId, name, isPersonal } = req.body || {};
      const userId = req.portalSession.userId;
      if (!guildId || !channelId) {
        return res.status(400).json({ error: 'guildId y channelId son requeridos' });
      }
      let finalName;
      if (isPersonal) {
        const customName = (name || '').trim();
        const slug = customName ? customName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u00f1\u00e1\u00e9\u00ed\u00f3\u00fa\-]/gi, '') : '';
        finalName = slug ? `personal-${userId}-${slug}` : `personal-${userId}`;
      } else {
        const listName = (name || '').trim().toLowerCase();
        if (!listName) return res.status(400).json({ error: 'Nombre requerido para listas compartidas' });
        finalName = listName;
      }
      const existing = listRepository.getByChannelAndName(guildId, channelId, finalName);
      if (existing) return res.status(400).json({ error: `Ya existe una lista con ese nombre en ese canal` });
      const created = listRepository.create(guildId, channelId, finalName, userId);
      if (!created) return res.status(400).json({ error: 'No se pudo crear la lista' });
      listRepository.addMember(created.id, userId);
      userListPreferenceRepository.set(guildId, channelId, userId, created.id);
      const token = listTokenRepository.createOrGetToken(created.id);
      res.json({ ok: true, list: { ...created, token, displayName: getListDisplayName(created, userId) } });
    } catch (err) {
      console.error('[Web] create list:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/portal/logout', (req, res) => {
    clearSessionCookie(res);
    res.redirect('/portal');
  });

  const port = config.web.port;
  app.listen(port, () => {
    console.log(`[Web] Vista lista en http://localhost:${port} (baseUrl: ${config.web.baseUrl})`);
  });

  return app;
}
