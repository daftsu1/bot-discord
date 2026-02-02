import express from 'express';
import { config } from '../config/index.js';
import { channelTokenRepository } from '../database/repositories/channelTokenRepository.js';
import { shoppingRepository } from '../database/repositories/shoppingRepository.js';
import { listPageHtml } from './page.js';

const WEB_USER_ID = 'web';

export function createWebServer() {
  const app = express();
  app.use(express.json());

  /** Resuelve guild/channel desde el token. */
  function resolveChannel(req, res, next) {
    const token = req.params.token;
    if (!token) {
      return res.status(400).send('Token requerido');
    }
    const row = channelTokenRepository.getByToken(token);
    if (!row) {
      return res.status(404).send('Enlace no válido o expirado');
    }
    req.channelContext = { guildId: row.guild_id, channelId: row.channel_id };
    next();
  }

  /** Página de la lista (para abrir en el celular). */
  app.get('/v/:token', (req, res) => {
    const row = channelTokenRepository.getByToken(req.params.token);
    if (!row) {
      return res.status(404).send('Enlace no válido o expirado');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(listPageHtml());
  });

  /** API: lista de ítems del canal. */
  app.get('/api/v/:token/items', resolveChannel, (req, res) => {
    try {
      const { guildId, channelId } = req.channelContext;
      const items = shoppingRepository.getItems(guildId, channelId, { includePurchased: true });
      res.json(items);
    } catch (err) {
      console.error('[Web] GET items:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /** API: marcar ítem como comprado. */
  app.post('/api/v/:token/items/mark', resolveChannel, (req, res) => {
    try {
      const { guildId, channelId } = req.channelContext;
      const { itemName } = req.body || {};
      if (!itemName || typeof itemName !== 'string') {
        return res.status(400).json({ error: 'itemName requerido' });
      }
      const result = shoppingRepository.markAsPurchased(guildId, channelId, itemName.trim(), WEB_USER_ID);
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
  app.post('/api/v/:token/items/unmark', resolveChannel, (req, res) => {
    try {
      const { guildId, channelId } = req.channelContext;
      const { itemName } = req.body || {};
      if (!itemName || typeof itemName !== 'string') {
        return res.status(400).json({ error: 'itemName requerido' });
      }
      const result = shoppingRepository.unmarkAsPurchased(guildId, channelId, itemName.trim());
      if (!result) {
        return res.status(404).json({ error: 'No se encontró el producto en la lista' });
      }
      res.json({ ok: true, item: result });
    } catch (err) {
      console.error('[Web] POST unmark:', err);
      res.status(500).json({ error: err.message });
    }
  });

  const port = config.web.port;
  app.listen(port, () => {
    console.log(`[Web] Vista lista en http://localhost:${port} (baseUrl: ${config.web.baseUrl})`);
  });

  return app;
}
