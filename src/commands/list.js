import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { shoppingService } from '../services/shoppingService.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('lista')
    .setDescription('Muestra la lista de compras del canal')
    .addBooleanOption(opt =>
      opt.setName('incluir_comprados')
        .setDescription('Incluir productos ya comprados (default: true)')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const includePurchased = interaction.options.getBoolean('incluir_comprados') ?? true;

    try {
      const items = shoppingService.getList(
        interaction.guildId,
        interaction.channelId,
        { includePurchased }
      );

      if (items.length === 0) {
        return interaction.editReply({
          content: '📋 La lista está vacía. Usa `/agregar` para añadir productos.'
        });
      }

      const pending = items.filter(i => !i.is_purchased);
      const purchased = items.filter(i => i.is_purchased);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🛒 Lista de compras')
        .setFooter({ text: `Canal #${interaction.channel?.name || 'actual'}` })
        .setTimestamp();

      if (pending.length > 0) {
        const grouped = groupByCategory(pending);
        const text = formatItems(grouped);
        embed.addFields({ name: 'Por comprar', value: text || '*Nada*', inline: false });
      }

      if (purchased.length > 0 && includePurchased) {
        const grouped = groupByCategory(purchased);
        const text = formatItems(grouped, true);
        embed.addFields({ name: 'Comprados ✓', value: text || '*Nada*', inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({
        content: `❌ ${err.message}`,
        ephemeral: true
      });
    }
  }
};

function groupByCategory(items) {
  const map = new Map();
  map.set(null, []);
  for (const item of items) {
    const category = item.category || null;
    if (!map.has(category)) map.set(category, []);
    map.get(category).push(item);
  }
  return map;
}

function formatItems(grouped, strikethrough = false) {
  const lines = [];
  const categories = [...grouped.keys()].filter(Boolean).sort();
  if (grouped.has(null)) categories.unshift(null);

  for (const category of categories) {
    const list = grouped.get(category);
    if (category) lines.push(`**${category}**`);
    for (const item of list) {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
      const text = `${item.name}${qty}`;
      const formatted = strikethrough ? `~~${text}~~` : `• ${text}`;
      lines.push(formatted);
    }
  }
  return lines.join('\n') || '*Nada*';
}
