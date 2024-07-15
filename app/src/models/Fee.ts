import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DbConnections } from './DbConnections';
import Parking from './Parking'; // Assuming Parcheggio model is defined in a separate file

const sequelize: Sequelize = DbConnections.getConnection();

interface FeeAttributes {
  id: number;
  parking_id: number;
  name: string;
  hourly_amount: number; // Use a number type for decimal values
  vehicle_type: string;
  night: boolean;
  festive: boolean;
  deletedAt?: Date; // Optional deletedAt attribute for paranoid
}

interface FeeCreationAttributes extends Optional<FeeAttributes, 'id'> { }

class Fee extends Model<FeeAttributes, FeeCreationAttributes> implements FeeAttributes {
  public id!: number;
  public parking_id!: number;
  public name!: string;
  public hourly_amount!: number;
  public vehicle_type!: string;
  public night!: boolean;
  public festive!: boolean;
  public deletedAt?: Date; // Optional deletedAt attribute for paranoids
}

Fee.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    hourly_amount: {
      type: DataTypes.DECIMAL(10, 2), // Use DECIMAL for precise monetary values
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    night: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    festive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: sequelize,
    tableName: 'fees',
    paranoid: true, // Enable soft delete
    createdAt: false, // Disable createdAt since we are not using it
    updatedAt: false, // Disable updatedAt since we are not using it
    deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
  }
);

// Define the association between Fee and Parcheggio (optional)
Fee.belongsTo(Parking, { foreignKey: 'parking_id', onDelete: 'CASCADE' });

export default Fee;
