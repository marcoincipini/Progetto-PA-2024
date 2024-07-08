import {Sequelize} from 'sequelize';
import { DbConnections } from "./DbConnections";

const connection: Sequelize = DbConnections.getConnection();

(async () => {
    try {
      await connection.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  })();
  
