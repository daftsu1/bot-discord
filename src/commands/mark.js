import { SlashCommandBuilder } from 'discord.js';
import { shoppingService } from '../services/shoppingService.js';
import { LIMITS } from '../validation/constants.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('marcar')
    .setDescription('Marca un producto como comprado o desmarca')
    .addSubcommand(sub =>
      sub.setName('comprado')
        .setDescription('Marca un producto como comprado')
        .addStringOption(opt =>
          opt.setName('producto')
            .setDescription('Nombre del producto')
            .setRequired(true)
            .setMaxLength(LIMITS.PRODUCT_NAME_MAX_LENGTH)
        )
        .addNumberOption(opt =>
          opt.setName('precio')
            .setDescription('Precio de compra (opcional)')
            .setRequired(false)
            .setMinValue(0)
        )
    )
    .addSubcommand(sub =>
      sub.setName('pendiente')
        .setDescription('Desmarca un producto (vuelve a pendiente)')
        .addStringOption(opt =>
          opt.setName('producto')
            .setDescription('Nombre del producto')
            .setRequired(true)
            .setMaxLength(LIMITS.PRODUCT_NAME_MAX_LENGTH)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const subcommand = interaction.options.getSubcommand();
    const product = interaction.options.getString('producto');
    const price = interaction.options.getNumber('precio');

    try {
      if (subcommand === 'comprado') {
        shoppingService.markAsPurchased(
          interaction.guildId,
          interaction.channelId,
          interaction.user.id,
          product,
          interaction.user.id,
          price
        );
        const priceStr = price != null ? ` ($${Number(price).toLocaleString('es-CL')})` : '';
        await interaction.editReply({
          content: `✅ **${product}** marcado como comprado.${priceStr}`
        });
      } else {
        shoppingService.unmarkAsPurchased(
          interaction.guildId,
          interaction.channelId,
          interaction.user.id,
          product
        );
        await interaction.editReply({
          content: `✅ **${product}** vuelto a pendiente.`
        });
      }
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
