// Import necessary modules from 'sequelize'
import { DataTypes, Model, Op, Optional, Sequelize } from 'sequelize';
// Import the database connection from 'DbConnections'
import { DbConnections } from './DbConnections';
// Import the 'Parking' and 'Transit' models
import Parking from './Parking'; // Assuming Parking and Transit models are defined in separate files
import Transit from './Transit';

// Get the database connection
const sequelize: Sequelize = DbConnections.getConnection();

// Define the attributes for the 'Bill' model
interface BillAttributes {
  id: number;
  parking_id: number;
  amount: number;
  entrance_transit: number;
  exit_transit: number;
  deletedAt?: Date; // Optional deletedAt attribute for soft deletion
}

// Define the attributes for creating a new 'Bill' instance
interface BillCreationAttributes extends Optional<BillAttributes, 'id'> { }

// Define the 'Bill' model
class Bill extends Model<BillAttributes, BillCreationAttributes> implements BillAttributes {
  public id!: number;
  public parking_id!: number;
  public amount!: number;
  public entrance_transit!: number;
  public exit_transit!: number;
  public deletedAt?: Date; // Optional deletedAt attribute for soft deletion

  // Method to get bill data based on billId
  static async getBillData(billId: number): Promise<Bill | null> {
    try {
      const bill = await this.findOne({
        where: { id: billId }
      });
      return bill;
    } catch (err) {
      return null;
    }
  }

  // Method to find bills by exit transits
  static async findBillByExitTransits(transits: number[]): Promise<Bill[]> {
    const bills = await Bill.findAll({
      include: [{
        model: Transit,
        as: 'exit',
        where: {
          id: {
            [Op.in]: transits,
          }
        },
      }]
    });
    return bills;
  }

  // Method to find bills by date time range
  static async findByDateTimeRange(
    startDateTime: string,
    endDateTime: string
  ): Promise<Bill[]> {
    return this.findAll({
      include: [{
        model: Transit,
        as: 'exit',
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn('CONCAT', sequelize.col('passing_by_date'), ' ', sequelize.col('passing_by_hour')),
              {
                [Op.between]: [startDateTime, endDateTime],
              }
            ),
          ],
        },
      }]
    });
  }

  // Method to find bills by date time range and parking id
  static async findByDateTimeRangeAndId(
    startDateTime: any,
    endDateTime: any,
    park_id: number,
  ): Promise<Bill[]> {
    return this.findAll({
      where: {
        parking_id: park_id
      },
      include: [{
        model: Transit,
        as: 'exit',
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn('CONCAT', sequelize.col('passing_by_date'), ' ', sequelize.col('passing_by_hour')),
              {
                [Op.between]: [startDateTime, endDateTime],
              }
            ),
          ],
        },
      }]
    });
  }

  // Method to find bills outside a date time range
  static async findBillsOutsideRange(startDateTime: string, endDateTime: string): Promise<Bill[]> {
    return this.findAll({
      include: [
        {
          model: Transit,
          as: 'entrance',
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn('CONCAT', sequelize.col('entrance.passing_by_date'), ' ', sequelize.col('entrance.passing_by_hour')),
                {
                  [Op.lt]: startDateTime,
                }
              ),
            ],
          },
        },
        {
          model: Transit,
          as: 'exit',
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn('CONCAT', sequelize.col('exit.passing_by_date'), ' ', sequelize.col('exit.passing_by_hour')),
                {
                  [Op.gt]: endDateTime,
                }
              ),
            ],
          },
        }
      ],
    });
  }
}

// Initialize the 'Bill' model
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
        model: Parking, // Reference the Parking model
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
    paranoid: true, // Enable soft delete
    createdAt: false, // Disable createdAt since we are not using it
    updatedAt: false, // Disable updatedAt since we are not using it
    deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
  }
);

// Define the associations between Bill and Parking & Transit (optional)
Bill.belongsTo(Parking, { foreignKey: 'parking_id', onDelete: 'CASCADE' });
Bill.belongsTo(Transit, { foreignKey: 'entrance_transit', as: 'entrance', onDelete: 'CASCADE' }); // Use alias for clarity
Bill.belongsTo(Transit, { foreignKey: 'exit_transit', as: 'exit', onDelete: 'CASCADE' }); // Use alias for clarity

// Export the 'Bill' model
export default Bill;
