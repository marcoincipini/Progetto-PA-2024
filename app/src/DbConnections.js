"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbConnections = void 0;
var dotenv = require("dotenv");
dotenv.config();
var core_1 = require("@sequelize/core");
var postgres_1 = require("@sequelize/postgres");
var DbConnections = /** @class */ (function () {
    function DbConnections() {
        this.connection = new core_1.Sequelize({
            dialect: postgres_1.PostgresDialect,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'), // Handle potential missing port
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            // Additional options (optional):
            // logging: console.log, // Enable logging (comment out for production)
            define: {
                timestamps: true, // Automatically add createdAt and updatedAt timestamps
            },
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
