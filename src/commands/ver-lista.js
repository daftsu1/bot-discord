import { SlashCommandBuilder } from 'discord.js';
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
      const baseUrl = config.web.baseUrl.replace(/\/$/, '');
      const link = `${baseUrl}/v/${token}`;

      await interaction.editReply({
        content: `📱 **Link para la lista "${display}":**\n${link}\n\nAbre este enlace en tu navegador para ver y marcar. El link es privado; no lo compartas si no quieres que otros editen esta lista.`,
        ephemeral: true
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
