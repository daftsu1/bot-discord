import { SlashCommandBuilder } from 'discord.js';
import { shoppingService } from '../services/shoppingService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('agregar')
    .setDescription('Agrega un producto a la lista de compras')
    .addStringOption(opt =>
      opt.setName('producto')
        .setDescription('Nombre del producto')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('cantidad')
        .setDescription('Cantidad (default: 1)')
        .setMinValue(1)
    )
    .addStringOption(opt =>
      opt.setName('categoria')
        .setDescription('Categoría (ej: lácteos, frutas)')
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const product = interaction.options.getString('producto');
    const quantity = interaction.options.getInteger('cantidad') ?? 1;
    const category = interaction.options.getString('categoria');

    try {
      const { item } = shoppingService.addItem(
        interaction.guildId,
        interaction.channelId,
        product,
        quantity,
        category
      );

      const categoryStr = item.category ? ` [${item.category}]` : '';
      await interaction.editReply({
        content: `✅ **${item.name}** x${item.quantity}${categoryStr} agregado a la lista.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
