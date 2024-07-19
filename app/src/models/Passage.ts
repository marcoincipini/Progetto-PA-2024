// Import necessary modules from 'sequelize'
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Import the database connection from 'DbConnections'
import { DbConnections } from './DbConnections';

// Import the model
import Parking from './Parking';

// Get the database connection
const sequelize: Sequelize = DbConnections.getConnection();

// Define the attributes for the 'Passage' model
interface PassageAttributes {
  id: number;
  parking_id: number;
  name: string;
  entrance: boolean;
  exit: boolean;
  deletedAt?: Date; // Optional deletedAt attribute for soft deletion
}

// Define the attributes for creating a new 'Passage' instance
interface PassageCreationAttributes extends Optional<PassageAttributes, 'id'> { }

// Define the 'Passage' model
class Passage extends Model<PassageAttributes, PassageCreationAttributes> implements PassageAttributes {
  public id!: number;
  public parking_id!: number;
  public name!: string;
  public entrance!: boolean;
  public exit!: boolean;
  public deletedAt?: Date; // Optional deletedAt attribute for soft deletion

  // Method to get passage data based on parkingId and name
  static async getPassageData(parkingId: number, nameP: string): Promise<Passage | null> {
    try {
      const passage = await this.findOne({
        where: {
          parking_id: parkingId,
          name: nameP
        }
      });
      return passage;
    } catch (err) {
      return null;
    }
  }

  // Method to join passage data with parking data
  static async passageJoin(passageId: number): Promise<Passage | null> {
    try {
      const passage = await this.findByPk(passageId, {
        include: [
          {
            model: Parking,
            as: 'parking',
            attributes: ['parking_id', 'day_starting_hour', 'day_finishing_hour']
          }
        ]
      });
      return passage;
    } catch (err) {
      return null;
    }
  }
}

// Initialize the 'Passage' model
Passage.init(
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
    entrance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    exit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: sequelize,
    tableName: 'passages',
    paranoid: true, // Enable soft delete
    createdAt: false, // Disable createdAt since we are not using it
    updatedAt: false, // Disable updatedAt since we are not using it
    deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
  }
);

// Define the association between Passage and Parking
Passage.belongsTo(Parking, { foreignKey: 'parking_id', as: 'parking', onDelete: 'CASCADE' });

// Export the 'Passage' model
export default Passage;
