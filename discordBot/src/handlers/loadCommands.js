const fs = require('node:fs');
const path = require('node:path');

const commandsRoot = path.join(__dirname, '..', 'commands');

/**
 * Parcourt src/commands/<categorie>/*.js et renvoie les commandes valides
 * @returns {Array<{data: import('discord.js').SlashCommandBuilder, execute: Function}>}
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
