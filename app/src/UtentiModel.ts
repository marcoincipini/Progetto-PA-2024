import {Sequelize, DataTypes} from 'sequelize';
import { DbConnections } from "./DbConnections";
//Connection to database
const connection: Sequelize = DbConnections.getConnection();

const Utenti = connection.define('Utenti', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  cognome: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  ruolo: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
  },
}, {
  // Other model options go here
});

const pippo = {
    "id": 1,
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@example.com",
    "password": "passwordsicura123",
    "ruolo": "admin",
    "token": 123.45
  }
  

  Utenti.build(pippo).save()
  .then(() => console.log('Dati salvati con successo'))
  .catch(err => console.error('Errore durante il salvataggio dei dati:', err));


console.log('toppe')
export default Utenti;
