import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { listService } from '../services/listService.js';
import { listTokenRepository } from '../database/repositories/listTokenRepository.js';
import { listRepository } from '../database/repositories/listRepository.js';
import { config } from '../config/index.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ver-lista')
    .setDescription('Obtén un link para ver y marcar la lista desde el celular')
    .addStringOption(opt =>
      opt.setName('lista')
        .setDescription('Nombre de la lista (opcional; por defecto la que estás usando)')
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const channelId = interaction.channelId;
    const userId = interaction.user.id;
    const listName = interaction.options.getString('lista');

    try {
      let list;
      if (listName) {
        const input = listName.trim().toLowerCase();
        if (input === 'mi lista') {
          list = listService.ensurePersonalList(guildId, channelId, userId);
        } else {
          list = listRepository.getByChannelAndName(guildId, channelId, listName);
        }
        if (!list) throw new Error(`No existe la lista "${listName}" en este canal.`);
        if (!listRepository.canUse(list.id, userId)) {
          throw new Error(`No puedes ver esa lista. Únete con \`/unirse\` (grupal) o usa \`/mi-lista\` para la tuya.`);
        }
      } else {
        list = listService.getCurrentList(guildId, channelId, userId);
        if (!list) {
          throw new Error('No tienes una lista activa. Usa `/usar-lista`, `/mi-lista` o `/crear-lista`.');
        }
      }

      const display = listService.getListDisplayName(list, userId);
      const token = listTokenRepository.createOrGet(list.id);
      const baseUrl = (config.web.baseUrl || '').replace(/\/$/, '').trim();
      const link = `${baseUrl}/v/${token}`;

      // Discord solo acepta URLs públicas en botones Link (no localhost) y valida el formato estrictamente
      const isPublicUrl = /^https?:\/\/(?!localhost|127\.0\.0\.1)[^\s]+/i.test(link);
      let urlValidForButton = false;
      if (isPublicUrl) {
        try {
          new URL(link);
          urlValidForButton = true;
        } catch (_) {
          urlValidForButton = false;
        }
      }

      const payload = {
        content: urlValidForButton
          ? `📱 **Link para la lista "${display}":**\n\nPulsa el botón para abrir la lista en tu navegador y marcar los productos. El link es privado; no lo compartas si no quieres que otros editen esta lista.`
          : `📱 **Link para la lista "${display}":**\n${link}\n\nAbre este enlace en tu navegador para ver y marcar. El link es privado; no lo compartas si no quieres que otros editen esta lista.`,
        ephemeral: true
      };

      if (urlValidForButton) {
        payload.components = [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel('Abrir lista')
              .setStyle(ButtonStyle.Link)
              .setURL(link)
          )
        ];
      }

      try {
        await interaction.editReply(payload);
      } catch (replyErr) {
        if (/invalid url|url/i.test(replyErr?.message || '')) {
          await interaction.editReply({
            content: `📱 **Link para la lista "${display}":**\n${link}\n\nAbre este enlace en tu navegador para ver y marcar. El link es privado; no lo compartas si no quieres que otros editen esta lista.`,
            ephemeral: true
          });
        } else {
          throw replyErr;
        }
      }
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
