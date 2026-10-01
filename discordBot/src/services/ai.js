const fs = require('node:fs');
const path = require('node:path');
const { OpenRouteur } = require('../config');
const { executerRechercheWeb } = require('./webSearch');
const { WorldCupIA } = require('./football');

const docfoot = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'foot.md'), 'utf-8');
const today = new Date().toISOString().split('T')[0];
const systemInstructions = `Tu es un agent IA autonome intégré sur un serveur Discord.
Ajourd'hui nous sommes ${today}.

RÈGLE CRITIQUE : Tu dois IMPÉRATIVEMENT répondre en utilisant UNIQUEMENT le format JSON suivant, sans aucun autre texte avant ou après, et sans balises de code markdown (\`\`\`).

Voici les structures de JSON possibles que tu as le droit de générer :

1. Si tu as besoin de chercher une information récente sur internet :
{
  "type": "tool_call",
  "tool": "recherche_web",
  "argument": "les mots-clés précis de ta recherche"
}

2. Si tu as besoin de chercher des informations sur le foot en te basant sur la documentation suivante :\n${docfoot}\n
{
  "type": "tool_call",
  "tool": "recherche_foot",
  "argument": "[https://api.football-data.org/v4/](https://api.football-data.org/v4/)..."
}

3. Si tu as la réponse ou que tu poursuis la discussion (Réponse finale) :
{
  "type": "final_response",
  "text": "Ton message de réponse complet en français ici."
}

Sois concis et utilise l'outil 'recherche_web' dès que la demande de l'utilisateur requiert des données en temps réel, de la météo, des actualités ou des faits récents.`;

/**
 * Gère la discussion avec l'IA et résout les appels d'outils (boucle de réflexion)
 * @param {Array} historiqueMessages - L'historique des messages pour le LLM
 * @param {number} tentative - Le compteur actuel de boucles
 * @returns {Promise<string>} - La réponse finale textuelle de l'IA
 */
async function genererReponseIA(historiqueMessages, tentative = 0) {
    const MAX_TENTATIVES = 3;
    const modeleSelectionne = "deepseek/deepseek-v4.1-flash";

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
    if (!data.choices || data.choices.length === 0) throw new Error("Aucune réponse reçue de l'IA.");

    const contenuBrut = data.choices[0].message.content.trim();

    try {
        // On parse TOUJOURS la réponse puisque l'IA doit répondre en JSON
        const objetIA = JSON.parse(contenuBrut);

        // CAS 1 : L'IA veut utiliser l'outil de recherche
        if (objetIA.type === "tool_call" && objetIA.tool === "recherche_web") {
            console.log(`[IA] Recherche web demandée (Étape ${tentative + 1}) : ${objetIA.argument}`);

            const resultatWeb = await executerRechercheWeb(objetIA.argument);

            // On garde le JSON de l'IA dans l'historique
            historiqueMessages.push({ role: "assistant", content: contenuBrut });

            // On lui injecte le résultat
            historiqueMessages.push({
                role: "user",
                content: `[RÉSULTAT DE L'OUTIL 'recherche_web'] : ${resultatWeb}\n\nAnalyse ce résultat pour donner ta réponse finale ou affiner ta recherche.`
            });

            // On relance la fonction (récursion)
            return await genererReponseIA(historiqueMessages, tentative + 1);
        } else if (objetIA.type === "tool_call" && objetIA.tool === "recherche_foot") {
            console.log(`[IA] Recherche foot demandée (Étape ${tentative + 1}) : ${objetIA.argument}`);

            const resultatFoot = await WorldCupIA(objetIA.argument);
            console.log(resultatFoot);

            // On garde le JSON de l'IA dans l'historique
            historiqueMessages.push({ role: "assistant", content: contenuBrut });

            // On lui injecte le résultat
            historiqueMessages.push({
                role: "user",
                content: `[RÉSULTAT DE L'OUTIL 'recherche_foot'] : ${resultatFoot}\n\nAnalyse ce résultat pour donner ta réponse finale ou affiner ta recherche.`
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

module.exports = { systemInstructions, genererReponseIA };
