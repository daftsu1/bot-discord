/**
 * Llamadas a la API de Discord usando el token del bot.
 * Para el portal: obtener guilds y canales donde el bot está.
 */
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const BASE = 'https://discord.com/api/v10';

async function api(path) {
  if (!BOT_TOKEN) return null;
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` }
  });
  if (!res.ok) return null;
  return res.json();
}

/** Guilds donde el bot está. */
export async function fetchGuilds() {
  const data = await api('/users/@me/guilds');
  if (!Array.isArray(data)) return [];
  return data.map(g => ({ id: g.id, name: g.name }));
}

/** Canales de texto de un guild (type 0 = GUILD_TEXT, 2 = GUILD_ANNOUNCEMENT). */
export async function fetchChannels(guildId) {
  const data = await api(`/guilds/${guildId}/channels`);
  if (!Array.isArray(data)) return [];
  return data
    .filter(c => c.type === 0 || c.type === 2)
    .map(c => ({ id: c.id, name: c.name }));
}

/** Enriquece listas con guildName y channelName. */
export async function enrichListsWithChannelInfo(lists) {
  const guildIds = [...new Set(lists.map(l => l.guildId))];
  const guildMap = new Map();
  const channelMap = new Map();

  const guilds = await fetchGuilds();
  for (const g of guilds) {
    guildMap.set(g.id, g.name);
  }

  for (const guildId of guildIds) {
    const channels = await fetchChannels(guildId);
    for (const c of channels) {
      channelMap.set(`${guildId}:${c.id}`, c.name);
    }
  }

  return lists.map(l => ({
    ...l,
    guildName: guildMap.get(l.guildId) || `Servidor`,
    channelName: channelMap.get(`${l.guildId}:${l.channelId}`) || `#canal`
  }));
}
