import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';
import Utente from './Utente'; // Assuming Utente model is defined in a separate file (better naming convention)

interface VeicoloAttributes {
  targa: string;
  tipoVeicolo: string; // Use camelCase for property names
  idUtente: number;
}

interface VeicoloCreationAttributes extends Optional<VeicoloAttributes, 'idUtente'> {}

class Veicolo extends Model<VeicoloAttributes, VeicoloCreationAttributes> implements VeicoloAttributes {
  public targa!: string;
  public tipoVeicolo!: string;
  public idUtente!: number;
}

Veicolo.init(
  {
    targa: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    tipoVeicolo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      field: 'tipo_veicolo', // Define the field name for the database column
    },
    idUtente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Utente, // Reference the Utente model
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'veicoli',
    timestamps: false,
  }
);

// Define the association between Veicolo and Utente (optional)
Veicolo.belongsTo(Utente, { foreignKey: 'idUtente' });

export default Veicolo;
