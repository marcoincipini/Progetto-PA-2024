// Import 'dotenv' module for handling environment variables
import * as dotenv from 'dotenv';
// Configure dotenv
dotenv.config();

// Import Sequelize, an ORM for interacting with SQL databases
import { Sequelize } from 'sequelize';

// Definition of the DbConnections class
export class DbConnections {
    // Private variables for the instance and the database connection
    private static istance: DbConnections;
    private connection: Sequelize;

    // Private constructor to implement the Singleton pattern
    private constructor() {
        // Check that all necessary environment variables are set
        if (
            !process.env.DB_NAME ||
            !process.env.DB_USER ||
            !process.env.DB_PASSWORD ||
            !process.env.DB_HOST ||
            !process.env.DB_PORT
        ) {
            throw new Error("Environment variables are not set");
        }

        // Create a new Sequelize connection
        this.connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            dialect: 'postgres', // Assuming Postgres dialect based on original code
        });
    }

    // Static method to get the database connection
    static getConnection(): Sequelize {
        // If there is no instance of DbConnections, create a new one
        if (!DbConnections.istance) {
            DbConnections.istance = new DbConnections();
        }
        // Return the database connection
        return DbConnections.istance.connection;
    }
}