import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DbConnections } from './DbConnections';
import Parking from './Parking'; // Assuming Parcheggio and Transito models are defined in separate files
import Transit from './Transit';

const sequelize : Sequelize = DbConnections.getConnection();

interface BillAttributes {
  id: number;
  parking_id: number;
  amount: number;
  entrance_transit: number;
  exit_transit: number;
}

interface BillCreationAttributes extends Optional<BillAttributes, 'id'> {}

class Bill extends Model<BillAttributes, BillCreationAttributes> implements BillAttributes {
  public id!: number;
  public parking_id!: number;
  public amount!: number;
  public entrance_transit!: number;
  public exit_transit!: number;
}

Bill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    parking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Parking, // Reference the Parcheggio model
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // Use DECIMAL for precise monetary values
      allowNull: false,
    },
    entrance_transit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Transit, // Reference the Transit model
        key: 'id',
      },
    },
    exit_transit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Transit, // Reference the Transit model
        key: 'id',
      },
    },
  },
  {
    sequelize: sequelize,
    tableName: 'bills',
    timestamps: false,
  }
);

// Define the associations between Bill and Parcheggio & Transito (optional)
Bill.belongsTo(Parking, { foreignKey: 'parking_id',onDelete: 'CASCADE' });
Bill.belongsTo(Transit, { foreignKey: 'entrance_transit', as: 'entrance', onDelete: 'CASCADE' }); // Use alias for clarity
Bill.belongsTo(Transit, { foreignKey: 'exit_transit', as: 'exit', onDelete: 'CASCADE' }); // Use alias for clarity

export default Bill;
