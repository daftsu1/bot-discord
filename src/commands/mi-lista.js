import { SlashCommandBuilder } from 'discord.js';
import { listService } from '../services/listService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('mi-lista')
    .setDescription('Usa tu lista personal en este canal (solo tú ves y editas)'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const list = listService.ensurePersonalList(
        interaction.guildId,
        interaction.channelId,
        interaction.user.id
      );

      await interaction.editReply({
        content: `✅ Ahora usas **tu lista personal**. Los comandos /agregar, /lista, /quitar, etc. afectan solo a tu lista. Para trabajar en grupo, usa \`/usar-lista\` y elige una lista compartida o \`/unirse\` a una.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
