import { DataTypes, Model, Optional, Sequelize, Op } from 'sequelize';
import { DbConnections } from './DbConnections';
import Passage from './Passage'; // Assuming Passage and Vehicle models are defined in separate files
import Vehicle from './Vehicle';
import Parking from './Parking';

const sequelize: Sequelize = DbConnections.getConnection();

interface TransitAttributes {
  id: number;
  passage_id: number;
  plate: string;
  passing_by_date: Date; // Use appropriate data types
  passing_by_hour: string; // Use appropriate data types
  direction: string;
  vehicle_type: string;
  deletedAt?: Date; // Optional deletedAt attribute for paranoid
}

interface TransitCreationAttributes extends Optional<TransitAttributes, 'id'> { }

class Transit extends Model<TransitAttributes, TransitCreationAttributes> implements TransitAttributes {

  public id!: number;
  public passage_id!: number;
  public plate!: string;
  public passing_by_date!: Date;
  public passing_by_hour!: string;
  public direction!: string;
  public vehicle_type!: string;
  public deletedAt?: Date; // Optional deletedAt attribute for paranoid

  static async getTransitData(passageId: number, plateT: string, passingByDate: Date, passingByHour: string): Promise<Transit | null> {
    try {
      const transit = await this.findOne({
        where: {
          passage_id: passageId,
          plate: plateT,
          passing_by_date: passingByDate,
          passing_by_hour: passingByHour
        }
      });
      return transit;
    } catch (err) {
      return null;
    }
  }

  static async findByPlatesAndDateTimeRange(
    plates: string[],
    startDateTime: string,
    endDateTime: string
  ): Promise<Transit[]> {
    return this.findAll({
      where: {
        plate: {
          [Op.in]: plates,
        },
        [Op.and]: [
          sequelize.where(
            sequelize.fn('CONCAT', sequelize.col('passing_by_date'), ' ', sequelize.col('passing_by_hour')),
            {
              [Op.between]: [startDateTime, endDateTime],
            }
          ),
        ],
      },
    });
  }

  static async findByDateRange(startDateTime: string, endDateTime: string): Promise<any[]> {
    return await Transit.findAll({
      include: [
        {
          model: Passage,
          as: 'passage',
          attributes: ['parking_id'] // Non includere gli attributi del modello Passage nei risultati
        }
      ],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('CONCAT', sequelize.col('passing_by_date'), ' ', sequelize.col('passing_by_hour')),
            {
              [Op.between]: [startDateTime, endDateTime],
            }
          ),
        ],
      }
    });
  }

  static async countTransitsByParkingAndVehicleType(startDateTime: string, endDateTime: string) {
    const result = await Transit.findAll({
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
      include: [
        {
          model: Passage,
          as: 'passage',
          include: [
            {
              model: Parking,
              as: 'parking'
            }
          ]
        },
        {
          model: Vehicle,
          as: 'vehicle'
        }
      ],
    });
    return result;
  }

  static async transitJoins(startDateTime: any, endDateTime: any, park_id: number): Promise<any[]> {
    return await Transit.findAll({
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
      include: [
        {
          model: Passage,
          as: 'passage',
          attributes: null,
          where: {
            parking_id: park_id
          },
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['vehicle_type']
        }
      ]
    });
  }

  static async getEnterTransit(plates: string): Promise<Transit[]> {
    return await Transit.findAll({
      where: {
        plate: plates
      },
      order: [[sequelize.fn('CONCAT', sequelize.col('passing_by_date'), ' ', sequelize.col('passing_by_hour')), 'DESC']], limit: 1, 
    });
  }

}
Transit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    passage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Passage, // Reference the Passage model
        key: 'id',
      },
    },
    plate: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: Vehicle, // Reference the Vehicle model
        key: 'plate',
      },
    },
    passing_by_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'passing_by_date', // Define the field name for the database column
    },
    passing_by_hour: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'passing_by_hour', // Define the field name for the database column
    },
    direction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      field: 'vehicle_type', // Define the field name for the database column
    },
  },
  {
    sequelize: sequelize,
    tableName: 'transits',
    paranoid: true, // Enable soft delete
    createdAt: false, // Disable createdAt since we are not using it
    updatedAt: false, // Disable updatedAt since we are not using it
    deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
  }
);

// Define the associations between Transit and Passage & Vehicle (optional)
Transit.belongsTo(Passage, { foreignKey: 'passage_id', as: 'passage' });
Transit.belongsTo(Vehicle, { foreignKey: 'plate', as: 'vehicle' });

export default Transit;
