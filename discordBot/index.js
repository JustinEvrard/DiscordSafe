const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const { Client, Collection, Partials, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token, OpenRouteur, Tavily } = require('./config.json');
const { json } = require('node:stream/consumers');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Message,
		Partials.Reaction,
		Partials.User,
		Partials.Channel
	]
})
const systemInstructions = `Tu es un agent IA autonome sur un serveur Discord.
Tu as accès à UN SEUL outil pour chercher des informations récentes sur internet : 'recherche_web'.

RÈGLES CRITIQUES :
1. Si tu connais la réponse avec certitude ou que c'est une discussion générale, réponds normalement en français.
2. Si tu as besoin de chercher sur internet (météo, actualités, faits récents, etc.), tu dois UNIQUEMENT répondre avec l'objet JSON ci-dessous.
3. N'ajoute AUCUN texte avant ou après le JSON. N'écris PAS de formules comme "Je vais chercher pour toi".
4. N'enrobe PAS le JSON dans des balises de code Markdown (ne mets pas de \`\`\`json ... \`\`\`). Écris le texte brut du JSON.

FORMAT DE RECHERCHE :
{"action": "recherche_web", "argument": "ta recherche ici"}`

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const folderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folderPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(folderPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
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
});

// client.on(Events.MessageReactionAdd, async (reaction, user) => {
// 	if (user.bot) return;

// 	if (reaction.partial) {
// 		try {
// 			await reaction.fetch();
// 		} catch (error) {
// 			console.log('Erreur lors de la récupération du message partial:', error);
// 		}
// 	}

// 	const targerUser = '199127580119531520'

// 	if (user.id === targerUser) {
// 		const logChannel = reaction.message.guild.channels.cache.get('1254246569767604235');
// 		if (logChannel) {
// 			logChannel.send('Ca va ??');
// 		}
// 	}
// });

async function executerRechercheWeb(argument) {
    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: Tavily, 
                query: argument,
                search_depth: "basic",
                max_results: 3
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur API Tavily: ${response.status}`);
        }

        const data = await response.json();

        // On formate les résultats de la même manière pour l'IA
        return data.results.map(site => {
            return `Source: ${site.title}\nURL: ${site.url}\nContenu: ${site.content}`;
        }).join("\n\n");

    } catch (error) {
        console.error("Erreur fetch Tavily:", error);
        return "Impossible d'effectuer la recherche web pour le moment.";
    }
}



client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot) return;

	// --- TA COMMANDE IA ---
	if (message.content.startsWith("!ai ")) {
		const promptUtilisateur = message.content.slice(4);
		let historiqueMessages = [
			{ role: "system", content: systemInstructions },
			{ role: "user", content: promptUtilisateur }
		];
		await message.channel.sendTyping();

		try {
			let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${OpenRouteur}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					// On indique l'identifiant exact de ton modèle gratuit Nvidia
					model: "openai/gpt-oss-120b:free",
					messages: historiqueMessages,
					temperature: 0.2
				})
			});
			const data = await response.json();
			// Extraction du texte de la réponse
			let reponseIA = data.choices[0].message.content.trim();
			console.log(reponseIA.includes("recherche_web"));
			if (reponseIA.includes("recherche_web")) {
				try {
					const askTools = JSON.parse(reponseIA);
					console.log(reponseIA);
					if (askTools.action === "recherche_web") {
						console.log("ca passe 2");
						const resultatInternet = await executerRechercheWeb(askTools.argument);
						console.log(resultatInternet);

						historiqueMessages.push({ role: "assistant", content: reponseIA });
						historiqueMessages.push({ role: "user", content: `[RÉSULTAT DE L'OUTIL 'recherche_web'] : ${resultatInternet}\n\nUtilise cette information pour formuler ta réponse finale à l'utilisateur.` })
					}
					await message.channel.sendTyping();

					let secondResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
						method: "POST",
						headers: {
							"Authorization": `Bearer ${OpenRouteur}`,
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							// On indique l'identifiant exact de ton modèle gratuit Nvidia
							model: "poolside/laguna-m.1:free",
							messages: historiqueMessages,
							temperature: 0.2
						})
					});
					let secondData = await secondResponse.json();
					reponseIA = secondData.choices[0].message.content;


				} catch (jsonError) {
					console.error("L'IA a tenté de faire du JSON mais s'est trompée :", reponseIA);
				}
			}

			// Sécurité pour la limite des 2000 caractères de Discord
			if (reponseIA.length > 2000) {
				await message.reply(reponseIA.slice(0, 1999));
			} else {
				await message.reply(reponseIA);
			}

		} catch (error) {
			console.error("Erreur OpenRouter :", error);
			await message.reply("Une erreur est survenue en contactant le modèle Nvidia.");
		}
	}

});

client.login(token);



