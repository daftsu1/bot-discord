import { SlashCommandBuilder } from 'discord.js';
import { shoppingService } from '../services/shoppingService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('quitar')
    .setDescription('Quita un producto de la lista de compras')
    .addStringOption(opt =>
      opt.setName('producto')
        .setDescription('Nombre del producto a quitar')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const product = interaction.options.getString('producto');

    try {
      shoppingService.removeItem(
        interaction.guildId,
        interaction.channelId,
        product
      );

      await interaction.editReply({
        content: `✅ **${product}** eliminado de la lista.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
