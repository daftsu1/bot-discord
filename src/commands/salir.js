import { SlashCommandBuilder } from 'discord.js';
import { listService } from '../services/listService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('salir')
    .setDescription('Sal de una lista del canal (no borra la lista ni los productos)')
    .addStringOption(opt =>
      opt.setName('lista')
        .setDescription('Nombre de la lista de la que salir')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const listName = interaction.options.getString('lista');

    try {
      const list = listService.leaveList(
        interaction.guildId,
        interaction.channelId,
        listName,
        interaction.user.id
      );
      const display = listService.getListDisplayName(list, interaction.user.id);

      await interaction.editReply({
        content: `✅ Saliste de la lista **${display}**. Si era tu lista actual, ahora usas "general" (si existe).`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
