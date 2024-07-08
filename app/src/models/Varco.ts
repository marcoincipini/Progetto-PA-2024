import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';
import Parcheggio from './Parcheggio'; // Assuming Parcheggio model is defined in a separate file

interface VarcoAttributes {
  id: number;
  idParcheggio: number; // Use camelCase for property names
  nome: string;
  ingresso: boolean;
  uscita: boolean;
}

interface VarcoCreationAttributes extends Optional<VarcoAttributes, 'id'> {}

class Varco extends Model<VarcoAttributes, VarcoCreationAttributes> implements VarcoAttributes {
  public id!: number;
  public idParcheggio!: number;
  public nome!: string;
  public ingresso!: boolean;
  public uscita!: boolean;
}

Varco.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idParcheggio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Parcheggio, // Reference the Parcheggio model
        key: 'id',
      },
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ingresso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    uscita: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'varchi',
    timestamps: false,
  }
);

// Define the association between Varco and Parcheggio (optional)
Varco.belongsTo(Parcheggio, { foreignKey: 'idParcheggio' });

export default Varco;
