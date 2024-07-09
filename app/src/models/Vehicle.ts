import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DbConnections } from './DbConnections';
import User from './User'; // Assuming User model is defined in a separate file (better naming convention)

const sequelize : Sequelize = DbConnections.getConnection();

interface VehicleAttributes {
  plate: string;
  vehicle_type: string; // Use camelCase for property names
  User_id: number;
}

interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'User_id'> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public plate!: string;
  public vehicle_type!: string;
  public User_id!: number;
}

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
    User_id: {
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
    timestamps: false,
  }
);

// Define the association between Vehicle and User (optional)
Vehicle.belongsTo(User, { foreignKey: 'User_id' });

export default Vehicle;
