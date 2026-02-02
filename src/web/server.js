import express from 'express';
import { config } from '../config/index.js';
import { channelTokenRepository } from '../database/repositories/channelTokenRepository.js';
import { listTokenRepository } from '../database/repositories/listTokenRepository.js';
import { listRepository } from '../database/repositories/listRepository.js';
import { shoppingRepository } from '../database/repositories/shoppingRepository.js';
import { listPageHtml } from './page.js';

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

  const port = config.web.port;
  app.listen(port, () => {
    console.log(`[Web] Vista lista en http://localhost:${port} (baseUrl: ${config.web.baseUrl})`);
  });

  return app;
}
