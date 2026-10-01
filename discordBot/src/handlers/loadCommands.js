/**
 * Chargement automatique des commandes slash.
 * @module handlers/loadCommands
 */

const fs = require('node:fs');
const path = require('node:path');

const commandsRoot = path.join(__dirname, '..', 'commands');

/**
 * Une commande slash, telle qu'exportée par un fichier de src/commands.
 * @typedef {Object} Commande
 * @property {SlashCommandBuilder} data - Définition de la commande (nom, description, options)
 * @property {function(ChatInputCommandInteraction): Promise<void>} execute - Code lancé quand la commande est utilisée
 */

/**
 * Parcourt `src/commands/<categorie>/*.js` et renvoie les commandes valides.
 * Un fichier sans `data` ou sans `execute` est ignoré avec un avertissement.
 * @returns {Commande[]}
 */
function loadCommands() {
    const commands = [];

    for (const folder of fs.readdirSync(commandsRoot)) {
        const commandsPath = path.join(commandsRoot, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    return commands;
}

module.exports = { loadCommands };
