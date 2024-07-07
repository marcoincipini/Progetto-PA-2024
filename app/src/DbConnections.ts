import * as dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';

export class DbConnections {
    private static istance: DbConnections;
    private connection: Sequelize;
    private constructor() {
        this.connection = new Sequelize({
            dialect: PostgresDialect,
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
    static getConnection(): Sequelize {
        if (!DbConnections.istance) {
            DbConnections.istance = new DbConnections();
        }
        return DbConnections.istance.connection;
    }
}
  