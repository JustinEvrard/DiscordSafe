/**
 * Timer de réapparition de Gartua (gardé en mémoire, perdu au redémarrage du bot).
 * @module services/bossTimer
 */

const RESPAWN = 12 * 60 * 60 * 1000;   // 12 h
const RAPPEL = 10 * 60 * 1000;         // rappel 10 min avant

const ID_SALON = "1553768927438311544";
const ID_ROLE = "1564355018071605389";

let prochainSpawn = null;
let timerRappel = null;
let timerSpawn = null;

/**
 * Envoie un message dans le salon des boss.
 * @param {Client} client - Le client discord.js
 * @param {string} texte - Le message à envoyer
 */
async function envoyer(client, texte) {
    try {
        const channel = await client.channels.fetch(ID_SALON);
        await channel.send(texte);
    } catch (error) {
        console.error("Erreur ping Gartua :", error);
    }
}

/**
 * Lance (ou relance) le timer de Gartua à partir de l'heure du kill.
 * @param {Client} client - Le client discord.js
 * @param {number} [heureKill=Date.now()] - Heure du kill en millisecondes
 * @returns {number} Heure de réapparition en millisecondes
 */
function gartuaDead(client, heureKill = Date.now()) {
    const heure = heureKill + RESPAWN;
    const delai = heure - Date.now();

    // Annule un éventuel timer précédent (évite les doubles pings)
    clearTimeout(timerRappel);
    clearTimeout(timerSpawn);
    prochainSpawn = heure;

    // Rappel 10 min avant, seulement s'il reste plus de 10 min
    if (delai > RAPPEL) {
        timerRappel = setTimeout(() => {
            envoyer(client, `⏰ Gartua réapparaît dans 10 minutes ! <@&${ID_ROLE}>`);
        }, delai - RAPPEL);
    }

    timerSpawn = setTimeout(() => {
        envoyer(client, `🐉 Gartua est apparu ! <@&${ID_ROLE}>`);
        prochainSpawn = null;
    }, Math.max(delai, 0));

    return heure;
}

/**
 * @returns {number|null} Heure de réapparition prévue, ou null s'il n'y a pas de timer en cours
 */
function getProchainSpawn() {
    return prochainSpawn;
}

module.exports = { gartuaDead, getProchainSpawn };