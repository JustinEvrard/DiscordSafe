# Commandes et événements

Les commandes slash et les événements sont **chargés automatiquement** au démarrage : ajouter un fichier au bon endroit suffit, `index.js` n'a pas à être modifié.

## Commandes slash

### Format

Chaque fichier de `src/commands/<catégorie>/` exporte un objet avec deux propriétés :

| Propriété | Type | Rôle |
|---|---|---|
| `data` | `SlashCommandBuilder` | Nom, description et options de la commande |
| `execute` | `async (interaction) => void` | Code exécuté quand la commande est utilisée |

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Dit bonjour'),
    async execute(interaction) {
        await interaction.reply('Bonjour !');
    },
};
```

### Chargement

`handlers/loadCommands.js` :
1. liste les sous-dossiers de `src/commands/` (les catégories) ;
2. charge chaque fichier `.js` qu'ils contiennent ;
3. garde ceux qui exportent `data` et `execute`, et affiche un `[WARNING]` pour les autres.

Le résultat est utilisé à deux endroits :
- `src/index.js` remplit `client.commands` pour exécuter les commandes ;
- `scripts/deploy-commands.js` envoie leur définition à Discord.

### Enregistrement auprès de Discord

Discord doit connaître une commande pour l'afficher aux utilisateurs. Après avoir **ajouté, supprimé ou modifié la définition** (`data`) d'une commande :

```bash
npm run deploy-commands
```

Le script remplace l'ensemble des commandes **globales** de l'application (`Routes.applicationCommands`). Modifier seulement le contenu de `execute` ne nécessite pas de relancer le script, un redémarrage du bot suffit.

> Les commandes globales peuvent mettre un moment à apparaître dans tous les serveurs.

## Événements

### Format

Chaque fichier de `src/events/` exporte :

| Propriété | Type | Rôle |
|---|---|---|
| `name` | `string` | Nom de l'événement, une valeur de `Events` (discord.js) |
| `once` | `boolean` (optionnel) | `true` pour ne réagir qu'une seule fois |
| `execute` | `async (...args) => void` | Reçoit les arguments de l'événement |

```js
const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        // ...
    },
};
```

Les arguments reçus par `execute` dépendent de l'événement (voir la [documentation discord.js](https://discord.js.org/docs/packages/discord.js/main/ClientEvents:Interface)).

### Événements existants

| Fichier | Événement | Rôle |
|---|---|---|
| `ready.js` | `clientReady` (once) | Log de connexion ; contient la notification Coupe du Monde (désactivée) |
| `interactionCreate.js` | `interactionCreate` | Exécute les commandes slash |
| `messageCreate.js` | `messageCreate` | Commande `!ai` — voir [Assistant IA](assistant-ia.md) |

### Intents

Un événement n'est reçu que si l'intent correspondant est déclaré dans `src/index.js`. Par exemple, un événement vocal demande `GatewayIntentBits.GuildVoiceStates`. Voir [Architecture](architecture.md#intents-et-partials).

## Tâche planifiée (désactivée)

`ready.js` contient, en commentaire, une notification quotidienne à 8 h (heure de Montréal) qui envoie le programme de la Coupe du Monde dans le salon `idSalon` via `WorldCup()` (`services/football.js`). Pour la réactiver, décommenter les trois `require` en haut du fichier et le bloc `cron.schedule`.
