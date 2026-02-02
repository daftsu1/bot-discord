import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ayuda')
    .setDescription('Muestra los comandos disponibles del bot'),

  async execute(interaction) {
    const commands = interaction.client.commands;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🛒 Comandos disponibles')
      .setDescription('Lista de compras por canal. Cada canal tiene su propia lista.')
      .setFooter({ text: 'Bot Despensa' })
      .setTimestamp();

    const fields = [...commands.values()]
      .filter(c => c.data.name !== 'ayuda')
      .map(c => ({
        name: `/${c.data.name}`,
        value: c.data.description || '—',
        inline: false
      }));

    embed.addFields(fields);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
