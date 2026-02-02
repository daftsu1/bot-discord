import { SlashCommandBuilder } from 'discord.js';
import { channelTokenRepository } from '../database/repositories/channelTokenRepository.js';
import { config } from '../config/index.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ver-lista')
    .setDescription('Obtén un link para ver y marcar la lista desde el celular (o cualquier navegador)'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    const token = channelTokenRepository.createOrGet(guildId, channelId);
    const baseUrl = config.web.baseUrl.replace(/\/$/, '');
    const link = `${baseUrl}/v/${token}`;

    await interaction.editReply({
      content: `📱 **Link para ver la lista en el celular:**\n${link}\n\nAbre este enlace en tu navegador para ver la lista y marcar lo que ya compraste. El link es privado; no lo compartas si no quieres que otros editen esta lista.`,
      ephemeral: true
    });
  }
};
