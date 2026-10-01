/**
 * Événement `interactionCreate` : exécute les commandes slash.
 * @module events/interactionCreate
 */

const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    /**
     * Retrouve la commande dans `client.commands` et l'exécute.
     * En cas d'erreur, répond un message visible uniquement par l'utilisateur.
     * @param {Interaction} interaction - L'interaction reçue de Discord
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    },
};
