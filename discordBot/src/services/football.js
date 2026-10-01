const { FootballKey } = require('../config');

async function WorldCup() {
    const jour = new Date().toISOString().split('T')[0];
    const jourB = new Date(jour);
    jourB.setDate(jourB.getDate() + 1)
    const j = jourB.toISOString().split('T')[0];
    const url = `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${jour}&dateTo=${j}`;
    let matchFind = 0;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Auth-Token": FootballKey
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur API-Football : ${response.status}`);
        }
        const data = await response.json();
        const match = data.matches

        console.log("[DEBUG API-FOOTBALL] Données reçues :", JSON.stringify(data, null, 2));

        if (match.length === 0) {
            return "Pas de match aujourd'hui";
        }
        let messageMatchs = `🗓️ **PROGRAMME DU JOUR (${jour}) : <@&${'1514676368296902778'}>**\n\n`;
        match.forEach(element => {
            const equipeDomicile = element.homeTeam.name;
            const equipeExterieur = element.awayTeam.name;
            const heureFr = new Date(element.utcDate).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Paris'
            });
            const dateMatchCanada = new Date(element.utcDate).toLocaleDateString('fr-CA', {
                timeZone: 'America/Montreal'
            });
            if (dateMatchCanada === jour) {
                messageMatchs += `🏆 • **${equipeDomicile}** vs **${equipeExterieur}** à 🕐 ${heureFr}\n`;
                matchFind++;
            }

        });
        if (matchFind === 0) {
            return "**Aucun match aujourd'hui**"
        } else {
            return messageMatchs;
        }

    } catch (error) {
        console.error("Erreur lors du fetch API-Football :", error);
        return "❌ Impossible de récupérer les scores et matchs pour le moment.";
    }
}

async function WorldCupIA(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Auth-Token": FootballKey
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur API-Football : ${response.status}`);
        }
        const data = await response.json();
        const match = data.matches

        console.log("[DEBUG API-FOOTBALL] Données reçues :", JSON.stringify(data, null, 2));

        if (match.length === 0) {
            return "Pas de match aujourd'hui";
        }
        let messageMatchs = `🗓️ **PROGRAMME**\n\n`;
        match.forEach(element => {
            const equipeDomicile = element.homeTeam.name;
            const equipeExterieur = element.awayTeam.name;
            const heureFr = new Date(element.utcDate).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Paris'
            });

            messageMatchs += `🏆 • **${equipeDomicile}** vs **${equipeExterieur}** à 🕐 ${heureFr}\n`;
        });
        return messageMatchs;

    } catch (error) {
        console.error("Erreur lors du fetch API-Football :", error);
        return "❌ Impossible de récupérer les scores et matchs pour le moment.";
    }
}

module.exports = { WorldCup, WorldCupIA };
