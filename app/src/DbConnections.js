"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbConnections = void 0;
var dotenv = require("dotenv");
dotenv.config();
var sequelize_1 = require("sequelize");
var DbConnections = /** @class */ (function () {
    function DbConnections() {
        this.connection = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            dialect: 'postgres', // Assuming Postgres dialect based on original code
        });
    }
    DbConnections.getConnection = function () {
        if (!DbConnections.istance) {
            DbConnections.istance = new DbConnections();
        }
        return DbConnections.istance.connection;
    };
    return DbConnections;
}());
exports.DbConnections = DbConnections;
