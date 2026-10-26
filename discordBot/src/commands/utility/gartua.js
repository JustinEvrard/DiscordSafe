/**
 * Commande `/gartua` : lance le timer de réapparition de Gartua.
 * @module commands/utility/gartua
 */

const { SlashCommandBuilder } = require('discord.js');
const { gartuaDead } = require('../../services/bossTimer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gartua')
        .setDescription('Gartua vient de mourir : lance le timer de respawn')
        .addIntegerOption(option =>
            option.setName('il_y_a')
                .setDescription('Tué il y a combien de minutes ? (vide = maintenant)')
                .setMinValue(0)
                .setMaxValue(720)
        ),
    async execute(interaction) {
        const minutes = interaction.options.getInteger('il_y_a') ?? 0;
        const heureKill = Date.now() - minutes * 60 * 1000;
        const heure = gartuaDead(interaction.client, heureKill);
        const secondes = Math.floor(heure / 1000);

        await interaction.reply(`⏱️ Timer lancé ! Gartua réapparaît <t:${secondes}:R> (<t:${secondes}:t>).`);
    },
};