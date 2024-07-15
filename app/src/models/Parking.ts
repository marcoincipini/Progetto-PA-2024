import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DbConnections } from './DbConnections';

const sequelize: Sequelize = DbConnections.getConnection();

interface ParkingAttributes {
  id: number;
  name: string;
  parking_spots: number; // Use camelCase for property names
  occupied_spots: number;
  day_starting_hour: string; // Use appropriate data type for time
  day_finishing_hour: string; // Use appropriate data type for time
  deletedAt?: Date; // Optional deletedAt attribute for paranoid
}

interface ParkingCreationAttributes extends Optional<ParkingAttributes, 'id'> { }

class Parking extends Model<ParkingAttributes, ParkingCreationAttributes> implements ParkingAttributes {
  public id!: number;
  public name!: string;
  public parking_spots!: number;
  public occupied_spots!: number;
  public day_starting_hour!: string;
  public day_finishing_hour!: string;
  public deletedAt?: Date; // Optional deletedAt attribute for paranoid
}


Parking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    parking_spots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'parking_spots', // Define the field name for the database column
    },
    occupied_spots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'occupied_spots', // Define the field name for the database column
    },
    day_starting_hour: {
      type: DataTypes.TIME, // Use DataTypes.TIME for storing time
      allowNull: false,
      field: 'day_starting_hour', // Define the field name for the database column
    },
    day_finishing_hour: {
      type: DataTypes.TIME, // Use DataTypes.TIME for storing time
      allowNull: false,
      field: 'day_finishing_hour', // Define the field name for the database column
    },
  },
  {
    sequelize: sequelize,
    tableName: 'parkings',
    paranoid: true, // Enable soft delete
    createdAt: false, // Disable createdAt since we are not using it
    updatedAt: false, // Disable updatedAt since we are not using it
    deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
  }
);



export default Parking;