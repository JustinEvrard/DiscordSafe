/**
 * Mémoire courte de l'assistant IA, partagée par salon.
 *
 * Seules les questions et les réponses finales sont conservées (pas les résultats d'outils).
 * La mémoire vit en RAM : elle est perdue à chaque redémarrage du bot.
 * @module services/memory
 */

/** Nombre maximum d'échanges (question + réponse) gardés par salon. */
const MAX_ECHANGE = 10;
/** Durée d'inactivité (en ms) après laquelle la mémoire d'un salon est effacée. */
const EXPIRATION_MEMOIRE = 30 * 60 * 1000;

/**
 * Un message au format attendu par l'API OpenRouter.
 * @typedef {Object} MessageIA
 * @property {"system"|"user"|"assistant"} role - Auteur du message
 * @property {string} content - Texte du message
 */

/**
 * Conversations en cours, indexées par ID de salon.
 * @type {Map<string, {message: MessageIA[], lastMessage: number}>}
 */
const conversation = new Map();

/**
 * Renvoie l'historique d'un salon.
 * Si la conversation a expiré, elle est supprimée et un tableau vide est renvoyé.
 * @param {string} channelId - ID du salon Discord
 * @returns {MessageIA[]} Une copie des messages (modifier ce tableau ne touche pas la mémoire)
 */
function getHistorique(channelId) {
    const conv = conversation.get(channelId);
    if(!conv){
        return [];
    }else if(Date.now() - conv.lastMessage > EXPIRATION_MEMOIRE){
        conversation.delete(channelId);
        return [];
    }else{
        return [...conv.message];
    }
}

/**
 * Enregistre un échange dans la mémoire du salon, en ne gardant que les MAX_ECHANGE derniers.
 * Remet à zéro le délai d'expiration.
 * @param {string} channelId - ID du salon Discord
 * @param {string} question - Question posée par l'utilisateur
 * @param {string} reponse - Réponse finale de l'IA
 * @returns {void}
 */
function ajouterHistorique(channelId, question, reponse) {
    const messages = getHistorique(channelId);
    messages.push(
        {role: "user", content: question},
        {role: "assistant", content: reponse}
    );
    const last = messages.slice(-MAX_ECHANGE * 2);

    conversation.set(channelId, {message: last, lastMessage: Date.now()});
}

module.exports = {getHistorique, ajouterHistorique};
