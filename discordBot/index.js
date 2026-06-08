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
const systemInstructions = `Tu es un agent IA autonome intégré sur un serveur Discord.

RÈGLE CRITIQUE : Tu dois IMPÉRATIVEMENT répondre en utilisant UNIQUEMENT le format JSON suivant, sans aucun autre texte avant ou après, et sans balises de code markdown (\`\`\`).

Voici les deux structures de JSON possibles que tu as le droit de générer :

1. Si tu as besoin de chercher une information récente sur internet :
{
  "type": "tool_call",
  "tool": "recherche_web",
  "argument": "les mots-clés précis de ta recherche"
}

2. Si tu as la réponse ou que tu poursuis la discussion (Réponse finale) :
{
  "type": "final_response",
  "text": "Ton message de réponse complet en français ici."
}

Sois concis et utilise l'outil 'recherche_web' dès que la demande de l'utilisateur requiert des données en temps réel, de la météo, des actualités ou des faits récents.`;

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


/**
 * Gère la discussion avec l'IA et résout les appels d'outils (boucle de réflexion)
 * @param {Array} historiqueMessages - L'historique des messages pour le LLM
 * @param {number} tentative - Le compteur actuel de boucles
 * @returns {Promise<string>} - La réponse finale textuelle de l'IA
 */
async function genererReponseIA(historiqueMessages, tentative = 0) {
    const MAX_TENTATIVES = 3;
    const modeleSelectionne = "poolside/laguna-m.1:free";

    if (tentative >= MAX_TENTATIVES) {
        console.warn(`[IA] Limite de ${MAX_TENTATIVES} tentatives atteinte.`);
        return "Désolé, je n'ai pas réussi à finaliser ma recherche après plusieurs essais.";
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OpenRouteur}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modeleSelectionne,
            messages: historiqueMessages,
            temperature: 0.2
        })
    });

    if (!response.ok) throw new Error(`Erreur OpenRouter: ${response.status}`);

    const data = await response.json();
    console.log("RETOUR COMPLET DE L'IA :", JSON.stringify(data, null, 2));
    if (!data.choices || data.choices.length === 0) throw new Error("Aucune réponse reçue de l'IA.");

    const contenuBrut = data.choices[0].message.content.trim();

    try {
        // On parse TOUJOURS la réponse puisque l'IA doit répondre en JSON
        const objetIA = JSON.parse(contenuBrut);

        // CAS 1 : L'IA veut utiliser l'outil de recherche
        if (objetIA.type === "tool_call" && objetIA.tool === "recherche_web") {
            console.log(`[IA] Recherche web demandée (Étape ${tentative + 1}) : ${objetIA.argument}`);

            const resultatInternet = await executerRechercheWeb(objetIA.argument);

            // On garde le JSON de l'IA dans l'historique
            historiqueMessages.push({ role: "assistant", content: contenuBrut });
            
            // On lui injecte le résultat
            historiqueMessages.push({ 
                role: "user", 
                content: `[RÉSULTAT DE L'OUTIL 'recherche_web'] : ${resultatInternet}\n\nAnalyse ce résultat pour donner ta réponse finale ou affiner ta recherche.` 
            });

            // On relance la fonction (récursion)
            return await genererReponseIA(historiqueMessages, tentative + 1);
        }

        // CAS 2 : C'est la réponse finale pour l'utilisateur
        if (objetIA.type === "final_response") {
            return objetIA.text;
        }

        // Si le JSON est valide mais que le type est inconnu
        return "Une erreur interne est survenue dans la structure de ma pensée.";

    } catch (jsonError) {
        console.error("[IA] Le modèle n'a pas renvoyé un JSON valide :", contenuBrut);
        
        // Mode de secours (fallback) : Si le modèle a quand même écrit du texte normal au lieu du JSON
        return contenuBrut;
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
			const reponseFinale = await genererReponseIA(historiqueMessages);

			// Sécurité pour la limite des 2000 caractères de Discord
            if (reponseFinale.length > 2000) {
                await message.reply(reponseFinale.slice(0, 1999));
            } else {
                await message.reply(reponseFinale);
            }

		} catch (error) {
			console.error("Erreur OpenRouter :", error);
			await message.reply("Une erreur est survenue en contactant le modèle.");
		}
	}

});

client.login(token);



