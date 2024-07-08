import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';
import Parcheggio from './Parcheggio'; // Assuming Parcheggio model is defined in a separate file

interface TariffaAttributes {
  id: number;
  idParcheggio: number;
  nome: string;
  importo: number; // Use a number type for decimal values
  tipoVeicolo: string;
  notte: boolean;
  festivo: boolean;
}

interface TariffaCreationAttributes extends Optional<TariffaAttributes, 'id'> {}

class Tariffa extends Model<TariffaAttributes, TariffaCreationAttributes> implements TariffaAttributes {
  public id!: number;
  public idParcheggio!: number;
  public nome!: string;
  public importo!: number;
  public tipoVeicolo!: string;
  public notte!: boolean;
  public festivo!: boolean;
}

Tariffa.init(
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
    importo: {
      type: DataTypes.DECIMAL(10, 2), // Use DECIMAL for precise monetary values
      allowNull: false,
    },
    tipoVeicolo: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    notte: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    festivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'tariffe',
    timestamps: false,
  }
);

// Define the association between Tariffa and Parcheggio (optional)
Tariffa.belongsTo(Parcheggio, { foreignKey: 'idParcheggio' });

export default Tariffa;
