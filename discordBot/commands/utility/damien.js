const { SlashCommandBuilder }= require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
    .setName('damien')
    .setDescription('pign damien'),
    async execute(interaction){
        const id = '272103724263014401';
        await interaction.reply(`<@${id}> <@${id}> <@${id}> <@${id}> <@${id}> <@${id}> https://tenor.com/view/waiting-gif-26189612`);
    },
};