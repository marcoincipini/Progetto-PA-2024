import * as dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';


export class DbConnections {
    private static istance: DbConnections;
    private connection: Sequelize;
    private constructor() {
        if (
            !process.env.DB_NAME ||
            !process.env.DB_USER ||
            !process.env.DB_PASSWORD ||
            !process.env.DB_HOST ||
            !process.env.DB_PORT
        ) {
            throw new Error("Environment variables are not set");
        }

        this.connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            dialect: 'postgres', // Assuming Postgres dialect based on original code
        });



    }
    static getConnection(): Sequelize {
        if (!DbConnections.istance) {
            DbConnections.istance = new DbConnections();
        }
        return DbConnections.istance.connection;
    }
}