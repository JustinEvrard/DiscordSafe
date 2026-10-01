const path = require('node:path');

// config.json reste a la racine du bot (ignore par git), voir config.example.json
module.exports = require(path.join(__dirname, '..', 'config.json'));
