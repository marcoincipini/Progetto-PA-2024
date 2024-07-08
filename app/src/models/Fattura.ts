import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';
import Parcheggio from './Parcheggio'; // Assuming Parcheggio and Transito models are defined in separate files
import Transito from './Transito';

interface FatturaAttributes {
  id: number;
  idParcheggio: number;
  importo: number;
  transitoIngresso: number;
  transitoUscita: number;
}

interface FatturaCreationAttributes extends Optional<FatturaAttributes, 'id'> {}

class Fattura extends Model<FatturaAttributes, FatturaCreationAttributes> implements FatturaAttributes {
  public id!: number;
  public idParcheggio!: number;
  public importo!: number;
  public transitoIngresso!: number;
  public transitoUscita!: number;
}

Fattura.init(
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
    importo: {
      type: DataTypes.DECIMAL(10, 2), // Use DECIMAL for precise monetary values
      allowNull: false,
    },
    transitoIngresso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Transito, // Reference the Transito model
        key: 'id',
      },
    },
    transitoUscita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Transito, // Reference the Transito model
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'fatture',
    timestamps: false,
  }
);

// Define the associations between Fattura and Parcheggio & Transito (optional)
Fattura.belongsTo(Parcheggio, { foreignKey: 'idParcheggio' });
Fattura.belongsTo(Transito, { foreignKey: 'transitoIngresso', as: 'ingresso' }); // Use alias for clarity
Fattura.belongsTo(Transito, { foreignKey: 'transitoUscita', as: 'uscita' }); // Use alias for clarity

export default Fattura;
