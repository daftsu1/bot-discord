import { SlashCommandBuilder } from 'discord.js';
import { listService } from '../services/listService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('unirse')
    .setDescription('Únete a una lista grupal del canal para trabajar en conjunto')
    .addStringOption(opt =>
      opt.setName('lista')
        .setDescription('Nombre de la lista grupal')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const listName = interaction.options.getString('lista');

    try {
      const list = listService.joinList(
        interaction.guildId,
        interaction.channelId,
        listName,
        interaction.user.id
      );
      const display = listService.getListDisplayName(list, interaction.user.id);
      const listArg = list.name.startsWith('personal-') ? 'mi lista' : list.name;

      await interaction.editReply({
        content: `✅ Te uniste a la lista **${display}**. Para usarla escribe \`/usar-lista lista:${listArg}\`.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
