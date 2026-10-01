/**
 * Commande `/ping` : vérifie que le bot répond.
 * @module commands/utility/ping
 */

const { SlashCommandBuilder }= require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong'),
    async execute(interaction){
        await interaction.reply('Et puis pong');
    },
};