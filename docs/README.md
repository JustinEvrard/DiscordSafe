# Documentation technique

Documentation interne de **DiscordSafe** : comment le bot est construit, comment il fonctionne et comment le déployer.
Pour une présentation rapide du projet, voir le [README principal](../README.md).

## Sommaire

| Document | Contenu |
|---|---|
| [Architecture](architecture.md) | Organisation du code, démarrage du bot, intents |
| [Assistant IA](assistant-ia.md) | Fonctionnement de `!ai` : prompt, boucle d'outils, mémoire |
| [Commandes et événements](commandes-evenements.md) | Format des fichiers, chargement automatique, ajout de fonctionnalités |
| [Configuration](configuration.md) | Clés de `config.json` et où les obtenir |
| [Déploiement](deploiement.md) | CI/CD GitHub Actions, PM2, dépannage |

## Référence du code (JSDoc)

Chaque module et chaque fonction est documenté par des commentaires JSDoc dans le code.
Une référence HTML peut être générée depuis `discordBot/` :

```bash
npm run docs
```

Le site est créé dans `discordBot/docs-api/` (ignoré par Git) : ouvrir `docs-api/index.html` dans un navigateur.
Ces commentaires s'affichent aussi directement dans VS Code au survol d'une fonction.
