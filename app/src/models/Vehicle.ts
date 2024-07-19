// Import necessary modules from 'sequelize'
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Import the database connection from 'DbConnections'
import { DbConnections } from './DbConnections';

// Import the model
import User from './User'; 

// Get the database connection
const sequelize: Sequelize = DbConnections.getConnection();

// Define the attributes for the 'Vehicle' model
interface VehicleAttributes {
  plate: string;
  vehicle_type: string;
  user_id: number;
  deletedAt?: Date; // Optional deletedAt attribute for soft deletion
}

// Define the attributes for creating a new 'Vehicle' instance
interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'user_id'> { }

// Define the 'Vehicle' model
class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public plate!: string;
  public vehicle_type!: string;
  public user_id!: number;
  public deletedAt?: Date; // Optional deletedAt attribute for soft deletion

  // Method to get vehicle data based on plate
  static async getVehicleData(plate: string): Promise<Vehicle | null> {
    try {
      const vehicle = await this.findOne({
        where: { plate: plate }
      });
      return vehicle;
    } catch (err) {
      return null;
    }
  }

  // Method to get vehicles based on user email
  static async getVehiclesUser(email: string): Promise<Vehicle[]> {
    try {
      const vehicles = await Vehicle.findAll({
        include: [{
          model: User,
          where: { email },
          attributes: [] // Exclude user attributes from the result
        }]
      });
      return vehicles;
    } catch (err) {
      return null;
    }
  }
}

// Initialize the 'Vehicle' model
Vehicle.init(
  {
    plate: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    vehicle_type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      field: 'vehicle_type', // Define the field name for the database column
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Reference the User model
        key: 'id',
      },
    },
  },
  {
    sequelize: sequelize,
    tableName: 'vehicles',
    paranoid: true, // Enable soft deletion
    createdAt: false, // Disable createdAt since we are not using it
    updatedAt: false, // Disable updatedAt since we are not using it
    deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
  }
);

// Define the association between 'Vehicle' and 'User'
Vehicle.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Export the 'Vehicle' model
export default Vehicle;