const { Events } = require('discord.js');
// const cron = require('node-cron');
// const { idSalon } = require('../config');
// const { WorldCup } = require('../services/football');

module.exports = {
    name: Events.ClientReady,
    once: true,
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
