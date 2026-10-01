const { Client, Collection, Partials, GatewayIntentBits } = require('discord.js');
const { token } = require('./config');
const { loadCommands } = require('./handlers/loadCommands');
const { loadEvents } = require('./handlers/loadEvents');

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
});

client.commands = new Collection();
for (const command of loadCommands()) {
    client.commands.set(command.data.name, command);
}

loadEvents(client);

client.login(token);
