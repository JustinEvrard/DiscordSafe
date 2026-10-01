# DiscordSafe

Bot Discord en Node.js avec un assistant IA capable de chercher sur le web et de consulter les données football en temps réel.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-process%20manager-2B037A)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Déploiement](#déploiement)
- [Étendre le bot](#étendre-le-bot)
- [Documentation technique](#documentation-technique)

---

## Fonctionnalités

### Assistant IA — `!ai <question>`

Un agent conversationnel propulsé par un LLM via [OpenRouter](https://openrouter.ai). Le modèle peut décider d'appeler des outils avant de répondre :

| Outil | Rôle | Source |
|---|---|---|
| `recherche_web` | Actualités, météo, faits récents | [Tavily](https://tavily.com) |
| `recherche_foot` | Matchs, calendriers, compétitions | [football-data.org](https://www.football-data.org) |

Le bot enchaîne jusqu'à **3 appels d'outils** par question, puis renvoie une réponse finale en français (tronquée à la limite de 2000 caractères de Discord).

#### Mémoire de conversation

L'assistant se souvient des échanges précédents **dans chaque salon** :

- les **10 derniers échanges** (question + réponse) sont conservés par salon ;
- la mémoire d'un salon est **réinitialisée après 30 minutes** sans message à l'IA ;
- seules les questions et les réponses finales sont mémorisées — les résultats de recherche ne le sont pas, pour limiter la consommation de tokens.

La mémoire est stockée en RAM : elle est remise à zéro à chaque redémarrage du bot. Les limites se règlent dans [`src/services/memory.js`](discordBot/src/services/memory.js) (`MAX_ECHANGE`, `EXPIRATION_MEMOIRE`).

---

## Stack technique

- **Runtime** : Node.js 18+ (utilise `fetch` natif)
- **Librairie Discord** : [discord.js](https://discord.js.org) v14
- **IA** : OpenRouter (`deepseek/deepseek-v4.1-flash`)
- **Planification** : node-cron
- **Hébergement** : Oracle Cloud, process géré par PM2
- **CI/CD** : GitHub Actions (déploiement SSH à chaque push sur `main`)

---

## Structure du projet

```
DiscordSafe/
├── .github/workflows/
│   └── deploy.yml              # Déploiement automatique sur le serveur
├── docs/                       # Documentation technique
└── discordBot/
    ├── src/
    │   ├── index.js            # Point d'entrée : client, chargement, connexion
    │   ├── config.js           # Charge config.json
    │   ├── commands/           # Commandes slash, rangées par catégorie
    │   │   └── utility/
    │   ├── events/             # Un fichier par événement Discord
    │   │   ├── ready.js
    │   │   ├── interactionCreate.js
    │   │   └── messageCreate.js
    │   ├── handlers/           # Chargement automatique commandes / événements
    │   ├── services/           # Logique métier et appels API
    │   │   ├── ai.js           # Boucle agent IA + prompt système
    │   │   ├── football.js     # API football-data.org
    │   │   ├── memory.js       # Mémoire de conversation par salon
    │   │   └── webSearch.js    # API Tavily
    │   └── prompts/
    │       └── foot.md         # Documentation API injectée dans le prompt
    ├── scripts/
    │   └── deploy-commands.js  # Enregistre les commandes slash auprès de Discord
    ├── config.example.json
    ├── jsdoc.json              # Configuration de la doc HTML (npm run docs)
    └── package.json
```

---

## Installation

```bash
git clone https://github.com/JustinEvrard/DiscordSafe.git
cd DiscordSafe/discordBot
npm install
cp config.example.json config.json
```

Remplir ensuite `config.json` (voir ci-dessous).

---

## Configuration

Toute la configuration se trouve dans `discordBot/config.json`. Ce fichier est **ignoré par Git** et ne doit jamais être commité.

| Clé | Description |
|---|---|
| `token` | Token du bot ([Discord Developer Portal](https://discord.com/developers/applications)) |
| `clientId` | ID de l'application Discord |
| `guildId` | ID du serveur Discord |
| `OpenRouteur` | Clé API OpenRouter |
| `Tavily` | Clé API Tavily |
| `FootballKey` | Clé API football-data.org |
| `idSalon` | ID du salon pour les notifications automatiques |

---

## Utilisation

| Script | Action |
|---|---|
| `npm start` | Lance le bot |
| `npm run deploy-commands` | Enregistre / met à jour les commandes slash sur Discord |
| `npm run docs` | Génère la référence du code (JSDoc) dans `docs-api/` |

> `deploy-commands` est à relancer uniquement lorsqu'une commande slash est ajoutée, supprimée ou que sa définition change.

---

## Déploiement

Chaque push sur `main` déclenche le workflow [`deploy.yml`](.github/workflows/deploy.yml), qui se connecte au serveur en SSH puis :

1. récupère la dernière version de `main` ;
2. installe les dépendances de production ;
3. relance le bot avec PM2 sous le nom `mon-bot`.

**Secrets GitHub requis :**

| Secret | Description |
|---|---|
| `SERVER_IP` | Adresse IP du serveur |
| `SSH_PRIVATE_KEY` | Clé privée SSH de l'utilisateur `ubuntu` |

Le fichier `config.json` doit être présent sur le serveur dans `~/DiscordSafe/discordBot/`.

---

## Étendre le bot

### Ajouter une commande slash

Créer un fichier dans `src/commands/<catégorie>/` :

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

Puis exécuter `npm run deploy-commands`. Aucune modification de `index.js` n'est nécessaire.

### Ajouter un événement

Créer un fichier dans `src/events/` :

```js
const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        // ...
    },
};
```

Ajouter `once: true` pour un événement qui ne doit se déclencher qu'une seule fois. Il est branché automatiquement au démarrage.

---

## Documentation technique

Le fonctionnement interne du bot est détaillé dans [`docs/`](docs/README.md) :

- [Architecture](docs/architecture.md) — organisation du code et démarrage du bot
- [Assistant IA](docs/assistant-ia.md) — prompt, boucle d'outils et mémoire
- [Commandes et événements](docs/commandes-evenements.md) — format et chargement automatique
- [Configuration](docs/configuration.md) — clés et réglages
- [Déploiement](docs/deploiement.md) — CI/CD, PM2 et dépannage
