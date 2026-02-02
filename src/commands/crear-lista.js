import { SlashCommandBuilder } from 'discord.js';
import { listService } from '../services/listService.js';
import { LIMITS } from '../validation/constants.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('crear-lista')
    .setDescription('Crea una lista grupal en este canal (otros se unen con /unirse)')
    .addStringOption(opt =>
      opt.setName('nombre')
        .setDescription('Nombre del grupo (ej: piso, familia)')
        .setRequired(true)
        .setMaxLength(LIMITS.CATEGORY_MAX_LENGTH)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const name = interaction.options.getString('nombre');

    try {
      const list = listService.createList(
        interaction.guildId,
        interaction.channelId,
        name,
        interaction.user.id
      );

      await interaction.editReply({
        content: `✅ Lista grupal **${list.name}** creada. Ya estás en ella. Otros pueden unirse con \`/unirse lista:${list.name}\`. Para tu lista solo tú usa \`/mi-lista\`. Para cambiar de lista usa \`/usar-lista\`.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
