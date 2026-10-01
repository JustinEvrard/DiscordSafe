/**
 * Chargement automatique des événements Discord.
 * @module handlers/loadEvents
 */

const fs = require('node:fs');
const path = require('node:path');

const eventsRoot = path.join(__dirname, '..', 'events');

/**
 * Un événement Discord, tel qu'exporté par un fichier de src/events.
 * @typedef {Object} Evenement
 * @property {string} name - Nom de l'événement (une valeur de `Events` de discord.js)
 * @property {boolean} [once] - `true` pour ne réagir qu'une seule fois
 * @property {function(...*): Promise<void>} execute - Code lancé à chaque déclenchement
 */

/**
 * Branche chaque fichier de `src/events` sur le client.
 * Un evenement exporte `{ name, once?, execute(...args) }`.
 * @param {Client} client - Le client discord.js
 * @returns {void}
 */
function loadEvents(client) {
    const eventFiles = fs.readdirSync(eventsRoot).filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsRoot, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

module.exports = { loadEvents };
