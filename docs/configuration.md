# Configuration

Toute la configuration se trouve dans `discordBot/config.json`. Ce fichier contient des secrets : il est **ignoré par Git** et ne doit jamais être commité.

Pour le créer :

```bash
cd discordBot
cp config.example.json config.json
```

Il est chargé par `src/config.js`, que tous les autres fichiers importent.

## Clés

| Clé | Description | Où l'obtenir | Utilisée par |
|---|---|---|---|
| `token` | Token du bot | [Developer Portal](https://discord.com/developers/applications) → Bot → Reset Token | `index.js`, `deploy-commands.js` |
| `clientId` | ID de l'application | Developer Portal → General Information → Application ID | `deploy-commands.js` |
| `guildId` | ID du serveur Discord | Discord (mode développeur) → clic droit sur le serveur → Copier l'identifiant | non utilisé actuellement |
| `OpenRouteur` | Clé API OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | `services/ai.js` |
| `Tavily` | Clé API Tavily | [app.tavily.com](https://app.tavily.com) | `services/webSearch.js` |
| `FootballKey` | Clé API football-data.org | [football-data.org](https://www.football-data.org/client/register) | `services/football.js` |
| `idSalon` | Salon des notifications automatiques | Discord (mode développeur) → clic droit sur le salon | `events/ready.js` (cron désactivé) |

## Réglages du Developer Portal

Dans l'onglet **Bot** de l'application, activer l'intent privilégié **Message Content Intent**. Sans lui, le bot reçoit des messages vides et `!ai` ne fonctionne pas.

## Réglages dans le code

Ces valeurs ne sont pas dans `config.json` mais directement dans le code :

| Réglage | Valeur | Fichier |
|---|---|---|
| Modèle IA | `deepseek/deepseek-v4.1-flash` | `src/services/ai.js` |
| Température | `0.2` | `src/services/ai.js` |
| Appels d'outils max par question | `3` | `src/services/ai.js` |
| Échanges mémorisés par salon | `10` | `src/services/memory.js` |
| Expiration de la mémoire | 30 min | `src/services/memory.js` |
| Résultats de recherche web | `3` | `src/services/webSearch.js` |

## Sécurité

- Ne jamais partager `config.json` ni coller son contenu dans un ticket ou un message.
- Si une clé a fuité, la régénérer immédiatement depuis le service concerné, puis mettre à jour `config.json` sur le serveur.
