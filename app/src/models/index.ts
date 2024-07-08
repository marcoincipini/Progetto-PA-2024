import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
  }
);

const initModels = () => {
  // Importa tutti i modelli qui
  const User = require('./User').default;
  User.sync();
  // Sincronizza anche altri modelli qui se necessario
};

export { sequelize, initModels };
