import { SlashCommandBuilder } from 'discord.js';
import { shoppingService } from '../services/shoppingService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('limpiar')
    .setDescription('Limpia la lista de compras')
    .addBooleanOption(opt =>
      opt.setName('solo_comprados')
        .setDescription('Solo eliminar productos marcados como comprados (default: false)')
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const purchasedOnly = interaction.options.getBoolean('solo_comprados') ?? false;

    try {
      const { deleted } = shoppingService.clearList(
        interaction.guildId,
        interaction.channelId,
        interaction.user.id,
        { purchasedOnly }
      );

      if (deleted === 0) {
        return interaction.editReply({
          content: purchasedOnly
            ? '📋 No hay productos comprados para eliminar.'
            : '📋 La lista ya estaba vacía.'
        });
      }

      const message = purchasedOnly
        ? `✅ ${deleted} producto(s) comprado(s) eliminado(s) de la lista.`
        : `✅ Lista vaciada. Se eliminaron ${deleted} producto(s).`;

      await interaction.editReply({ content: message });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
