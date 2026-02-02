import { SlashCommandBuilder } from 'discord.js';
import { shoppingService } from '../services/shoppingService.js';
import { LIMITS } from '../validation/constants.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('agregar')
    .setDescription('Agrega un producto a la lista de compras')
    .addStringOption(opt =>
      opt.setName('producto')
        .setDescription('Nombre del producto')
        .setRequired(true)
        .setMaxLength(LIMITS.PRODUCT_NAME_MAX_LENGTH)
    )
    .addIntegerOption(opt =>
      opt.setName('cantidad')
        .setDescription('Cantidad (ej: 2 para 2 kg). Por defecto: 1')
        .setMinValue(1)
        .setMaxValue(LIMITS.QUANTITY_MAX)
    )
    .addStringOption(opt =>
      opt.setName('categoria')
        .setDescription('Categoría (ej: lácteos, frutas)')
        .setMaxLength(LIMITS.CATEGORY_MAX_LENGTH)
    )
    .addStringOption(opt =>
      opt.setName('unidad')
        .setDescription('Unidad: L, ml, kg, g, un (opcional)')
        .setMaxLength(LIMITS.UNIT_MAX_LENGTH)
        .addChoices(
          { name: 'Litros', value: 'L' },
          { name: 'Mililitros', value: 'ml' },
          { name: 'Kilogramos', value: 'kg' },
          { name: 'Gramos', value: 'g' },
          { name: 'Unidades', value: 'un' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const product = interaction.options.getString('producto');
    const quantity = interaction.options.getInteger('cantidad') ?? 1;
    const category = interaction.options.getString('categoria');
    const unit = interaction.options.getString('unidad');

    try {
      const { item } = shoppingService.addItem(
        interaction.guildId,
        interaction.channelId,
        interaction.user.id,
        product,
        quantity,
        category,
        unit
      );

      const categoryStr = item.category ? ` [${item.category}]` : '';
      const qty = item.quantity ?? 1;
      const unitStr = item.unit ? ` · ${qty} ${item.unit}` : (qty > 1 ? ` x${qty}` : '');
      await interaction.editReply({
        content: `✅ **${item.name}**${unitStr}${categoryStr} agregado a la lista.`
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};
