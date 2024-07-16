import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DbConnections } from './DbConnections';
import Parking from './Parking';

const sequelize: Sequelize = DbConnections.getConnection();

interface PassageAttributes {
  id: number;
  parking_id: number; // Use camelCase for property names
  name: string;
  entrance: boolean;
  exit: boolean;
  deletedAt?: Date; // Optional deletedAt attribute for paranoid
}

interface PassageCreationAttributes extends Optional<PassageAttributes, 'id'> { }

class Passage extends Model<PassageAttributes, PassageCreationAttributes> implements PassageAttributes {
  public id!: number;
  public parking_id!: number;
  public name!: string;
  public entrance!: boolean;
  public exit!: boolean;
  public deletedAt?: Date; // Optional deletedAt attribute for paranoid
}

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

// Define the association between Passage and Parking (optional)
Passage.belongsTo(Parking, { foreignKey: 'parking_id', as: 'parking', onDelete: 'CASCADE' });

export default Passage;
