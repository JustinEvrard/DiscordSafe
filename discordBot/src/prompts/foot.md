# API Football-Data.org v4 - Guide des Endpoints

## 0. Matchs (Matches)
Base URL OBLIGATOIRE : `https://api.football-data.org/v4/`

## 1. Matchs (Matches)
- Tous les matchs du jour : `matches`
- Filtrer par date : `matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`
- Matchs d'une compétition spécifique : `competitions/{code}/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`

## 2. Codes des Compétitions Majeures
- WC : Coupe du Monde (FIFA World Cup)
- CL : Ligue des Champions (UEFA Champions League)
- FL1 : Ligue 1 (France)
- PL : Premier League (Angleterre)
- PD : LaLiga (Espagne)
- SA : Serie A (Italie)
- BL1 : Bundesliga (Allemagne)
