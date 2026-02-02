import { SlashCommandBuilder } from 'discord.js';
import { listService } from '../services/listService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('usar-lista')
    .setDescription('Elige qué lista usar en este canal (/agregar, /lista, etc.)')
    .addStringOption(opt =>
      opt.setName('lista')
        .setDescription('Nombre de la lista a usar')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const listName = interaction.options.getString('lista');

    try {
      const list = listService.setCurrentList(
        interaction.guildId,
        interaction.channelId,
        interaction.user.id,
        listName
      );
      const display = listService.getListDisplayName(list, interaction.user.id);

      await interaction.editReply({
        content: `✅ Ahora usas la lista **${display}**. Los comandos /agregar, /lista, /quitar, etc. afectan a esta lista.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
