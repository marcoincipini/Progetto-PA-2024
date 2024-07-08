import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';
import Varco from './Varco'; // Assuming Varco and Veicolo models are defined in separate files
import Veicolo from './Veicolo';

interface TransitoAttributes {
  id: number;
  idVarco: number;
  targa: string;
  dataPassaggio: Date; // Use appropriate data types
  oraPassaggio: string; // Use appropriate data types
  verso: string;
  tipoVeicolo: string;
}

interface TransitoCreationAttributes extends Optional<TransitoAttributes, 'id'> {}

class Transito extends Model<TransitoAttributes, TransitoCreationAttributes> implements TransitoAttributes {
  public id!: number;
  public idVarco!: number;
  public targa!: string;
  public dataPassaggio!: Date;
  public oraPassaggio!: string;
  public verso!: string;
  public tipoVeicolo!: string;
}

Transito.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idVarco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Varco, // Reference the Varco model
        key: 'id',
      },
    },
    targa: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: Veicolo, // Reference the Veicolo model
        key: 'targa',
      },
    },
    dataPassaggio: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'data_passaggio', // Define the field name for the database column
    },
    oraPassaggio: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'ora_passaggio', // Define the field name for the database column
    },
    verso: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipoVeicolo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      field: 'tipo_veicolo', // Define the field name for the database column
    },
  },
  {
    sequelize,
    tableName: 'transiti',
    timestamps: false,
  }
);

// Define the associations between Transito and Varco & Veicolo (optional)
Transito.belongsTo(Varco, { foreignKey: 'idVarco' });
Transito.belongsTo(Veicolo, { foreignKey: 'targa' });

export default Transito;
