import { SlashCommandBuilder } from 'discord.js';
import { listService } from '../services/listService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('eliminar-lista')
    .setDescription('Elimina una lista y todos sus productos (solo el creador puede eliminarla)')
    .addStringOption(opt =>
      opt.setName('lista')
        .setDescription('Nombre de la lista a eliminar (o "mi lista" para tu lista personal)')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const listName = interaction.options.getString('lista');

    try {
      const list = listService.deleteList(
        interaction.guildId,
        interaction.channelId,
        listName,
        interaction.user.id
      );
      const display = listService.getListDisplayName(list, interaction.user.id);

      await interaction.editReply({
        content: `✅ Lista **${display}** eliminada (incluidos todos los productos). Quien la usaba pasará a "general" si existe.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
