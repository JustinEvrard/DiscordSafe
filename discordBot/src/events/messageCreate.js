const { Events } = require('discord.js');
const { systemInstructions, genererReponseIA } = require('../services/ai');
const { getHistorique, ajouterHistorique } = require('../services/memory');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // --- TA COMMANDE IA ---
        if (message.content.startsWith("!ai ")) {
            const promptUtilisateur = message.content.slice(3);
            let historiqueMessages = [
                { role: "system", content: systemInstructions },
                ...getHistorique(message.channel.id),
                { role: "user", content: promptUtilisateur }
            ];
            await message.channel.sendTyping();

            try {
                const reponseFinale = await genererReponseIA(historiqueMessages);
                ajouterHistorique(message.channel.id, promptUtilisateur, reponseFinale);
                // Sécurité pour la limite des 2000 caractères de Discord
                if (reponseFinale.length > 2000) {
                    await message.reply(reponseFinale.slice(0, 1999));
                } else {
                    await message.reply(reponseFinale);
                }

            } catch (error) {
                console.error("Erreur OpenRouter :", error);
                await message.reply(`Une erreur est survenue en contactant le modèle. ${error.message}`);
            }
        }
    },
};
