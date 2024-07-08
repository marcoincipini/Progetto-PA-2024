"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@sequelize/core");
var DbConnections_1 = require("./DbConnections");
//Connection to database
var connection = DbConnections_1.DbConnections.getConnection();
var Utenti = connection.define('Utenti', {
    id: {
        type: core_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: core_1.DataTypes.STRING(255),
        allowNull: false,
    },
    cognome: {
        type: core_1.DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: core_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password: {
        type: core_1.DataTypes.STRING(255),
        allowNull: false,
    },
    ruolo: {
        type: core_1.DataTypes.STRING(32),
        allowNull: false,
    },
    token: {
        type: core_1.DataTypes.STRING,
    },
}, {
// Other model options go here
});
var pippo = {
    "id": 1,
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@example.com",
    "password": "passwordsicura123",
    "ruolo": "admin",
    "token": 123.45
};
Utenti.build(pippo).save()
    .then(function () { return console.log('Dati salvati con successo'); })
    .catch(function (err) { return console.error('Errore durante il salvataggio dei dati:', err); });
console.log('toppe');
exports.default = Utenti;
