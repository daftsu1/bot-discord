import { SlashCommandBuilder } from 'discord.js';
import { shoppingService } from '../services/shoppingService.js';
import { LIMITS } from '../validation/constants.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('quitar')
    .setDescription('Quita un producto de la lista de compras')
    .addStringOption(opt =>
      opt.setName('producto')
        .setDescription('Nombre del producto a quitar')
        .setRequired(true)
        .setMaxLength(LIMITS.PRODUCT_NAME_MAX_LENGTH)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const product = interaction.options.getString('producto');

    try {
      shoppingService.removeItem(
        interaction.guildId,
        interaction.channelId,
        interaction.user.id,
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
