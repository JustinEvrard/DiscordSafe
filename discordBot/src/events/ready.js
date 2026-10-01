/**
 * Événement `clientReady` : déclenché une seule fois, quand le bot est connecté.
 * @module events/ready
 */

const { Events } = require('discord.js');
// const cron = require('node-cron');
// const { idSalon } = require('../config');
// const { WorldCup } = require('../services/football');

module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * Affiche le nom du bot dans la console.
     * Contient aussi, en commentaire, la notification quotidienne de la Coupe du Monde.
     * @param {Client} readyClient - Le client connecté
     * @returns {Promise<void>}
     */
    async execute(readyClient) {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        // Notification quotidienne Coupe du Monde
        // cron.schedule('0 8 * * *', async () => {
        //     try {
        //         const channel = await readyClient.channels.fetch(idSalon);
        //         await channel.send(await WorldCup());
        //     } catch (error) {
        //         console.error('Erreur lors du déclenchement du Cron :', error);
        //     }
        // },
        //     {
        //         scheduled: true,
        //         timezone: "America/Montreal"
        //     })
    },
};
