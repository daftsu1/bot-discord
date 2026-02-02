import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { initSchema } from './database/schema.js';
import { config } from './config/index.js';
import { createWebServer } from './web/server.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { readdirSync } from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const files = readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    const { command } = await import(pathToFileURL(filePath).href);
    if (command?.data?.name) {
      client.commands.set(command.data.name, command);
      console.log(`[Commands] Cargado: /${command.data.name}`);
    }
  }
}

async function registerSlashCommands() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID || client.user?.id;

  if (!token || !clientId) {
    console.warn('[Commands] DISCORD_CLIENT_ID no definido. Los comandos pueden tardar en aparecer.');
    return;
  }

  const commands = [...client.commands.values()].map(c => c.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log(`[Commands] ${commands.length} comandos registrados globalmente.`);
  } catch (err) {
    console.error('[Commands] Error registrando comandos:', err.message);
  }
}

client.once('clientReady', async () => {
  console.log(`[Bot] Conectado como ${client.user.tag}`);
  console.log(`[Config] Moneda: ${config.currency.code} (${config.currency.symbol})`);
  await registerSlashCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[Error] /${interaction.commandName}:`, err);
    const reply = { content: `❌ Error: ${err.message}`, ephemeral: true };
    try {
      if (interaction.deferred) {
        await interaction.editReply(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    } catch (_) {}
  }
});

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error('Falta DISCORD_BOT_TOKEN en .env');
    process.exit(1);
  }

  initSchema();
  createWebServer();
  await loadCommands();

  await client.login(token);
}

main().catch(err => {
  console.error('Error al iniciar:', err);
  process.exit(1);
});
