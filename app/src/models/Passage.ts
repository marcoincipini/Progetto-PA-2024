import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DbConnections } from './DbConnections';
import Parking from './Parking';

const sequelize : Sequelize = DbConnections.getConnection();

interface PassageAttributes {
  id: number;
  parking_id: number; // Use camelCase for property names
  name: string;
  entrance: boolean;
  exit: boolean;
}

interface PassageCreationAttributes extends Optional<PassageAttributes, 'id'> {}

class Passage extends Model<PassageAttributes, PassageCreationAttributes> implements PassageAttributes {
  public id!: number;
  public parking_id!: number;
  public name!: string;
  public entrance!: boolean;
  public exit!: boolean;
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
    paranoid:true,
    tableName: 'passages',
    deletedAt: 'destroyTime',
  }
);

// Define the association between Passage and Parking (optional)
Passage.belongsTo(Parking, { foreignKey: 'parking_id', onDelete: 'CASCADE' });

export default Passage;
