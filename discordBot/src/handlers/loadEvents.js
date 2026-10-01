const fs = require('node:fs');
const path = require('node:path');

const eventsRoot = path.join(__dirname, '..', 'events');

/**
 * Branche chaque fichier de src/events sur le client
 * Un evenement exporte { name, once?, execute(...args) }
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
