/**
 * Script à lancer avec `npm run deploy-commands` : enregistre les commandes slash auprès de Discord.
 * À relancer après l'ajout, la suppression ou la modification d'une commande.
 * @module scripts/deploy-commands
 */

const { REST, Routes } = require('discord.js');
const { clientId, token } = require('../src/config');
const { loadCommands } = require('../src/handlers/loadCommands');

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
const commands = loadCommands().map((command) => command.data.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
