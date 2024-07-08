import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

interface UtenteAttributes {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ruolo: string;
}

interface UtenteCreationAttributes extends Optional<UtenteAttributes, 'id'> {}

class Utente extends Model<UtenteAttributes, UtenteCreationAttributes> implements UtenteAttributes {
  public id!: number;
  public nome!: string;
  public cognome!: string;
  public email!: string;
  public password!: string;
  public ruolo!: string;
}

Utente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cognome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ruolo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'utenti',
    timestamps: false,
  }
);

export default Utente;
