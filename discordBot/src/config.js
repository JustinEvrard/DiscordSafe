/**
 * Configuration du bot (tokens, clés API, IDs), lue depuis config.json.
 * @module config
 */

const path = require('node:path');

// config.json reste a la racine du bot (ignore par git), voir config.example.json
module.exports = require(path.join(__dirname, '..', 'config.json'));
