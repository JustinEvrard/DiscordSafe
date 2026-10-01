const { Tavily } = require('../config');

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

module.exports = { executerRechercheWeb };
