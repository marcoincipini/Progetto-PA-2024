// Import necessary modules from 'sequelize'
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Import the database connection from 'DbConnections'
import { DbConnections } from './DbConnections';

// Import the model
import Parking from './Parking';

// Get the database connection
const sequelize: Sequelize = DbConnections.getConnection();

// Define the attributes for the 'Fee' model
interface FeeAttributes {
  id: number;
  parking_id: number;
  name: string;
  hourly_amount: number; // Use a number type for decimal values
  vehicle_type: string;
  night: boolean;
  festive: boolean;
  deletedAt?: Date; // Optional deletedAt attribute for soft deletion
}

// Define the attributes for creating a new 'Fee' instance
interface FeeCreationAttributes extends Optional<FeeAttributes, 'id'> { }

// Define the 'Fee' model
class Fee extends Model<FeeAttributes, FeeCreationAttributes> implements FeeAttributes {
  public id!: number;
  public parking_id!: number;
  public name!: string;
  public hourly_amount!: number;
  public vehicle_type!: string;
  public night!: boolean;
  public festive!: boolean;
  public deletedAt?: Date; // Optional deletedAt attribute for soft deletion

  // Method to get fee data based on parkingId and name
  static async getFeeData(parkingId: number, nameF: string): Promise<Fee | null> {
    try {
      const fee = await this.findOne({
        where: {
          parking_id: parkingId,
          name: nameF
        }
      });
      return fee;
    } catch (err) {
      return null;
    }
  }

  // Method to get fee based on vehicleType and parkingId
  static async getFee(vehicleType: string, parkingId: number): Promise<Fee[]> {
    try {
      const fee = await this.findAll({
        where: {
          parking_id: parkingId,
          vehicle_type: vehicleType
        }
      });
      return fee;
    } catch (err) {
      return null;
    }
  }
}

// Initialize the 'Fee' model
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
        model: Parking, // Reference the Parking model
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
    paranoid: true, // Enable soft deletion
    createdAt: false, // Disable createdAt since we are not using it
    updatedAt: false, // Disable updatedAt since we are not using it
    deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
  }
);

// Define the association between 'Fee' and 'Parking'
Fee.belongsTo(Parking, { foreignKey: 'parking_id', onDelete: 'CASCADE' });

// Export the 'Fee' model
export default Fee;