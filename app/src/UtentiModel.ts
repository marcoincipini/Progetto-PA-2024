import {DbConnections} from "./DbConnections";
import {DataTypes, Sequelize} from 'sequelize';

//Connection to database
const connection: Sequelize = DbConnections.getConnection();

console.log(connection);