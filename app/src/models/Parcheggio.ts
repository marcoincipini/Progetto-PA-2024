import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

interface ParcheggioAttributes {
  id: number;
  nome: string;
  postiAuto: number; // Use camelCase for property names
  postiOccupati: number;
  oraInizioGiorno: string; // Use appropriate data type for time
  oraFineGiorno: string; // Use appropriate data type for time
}

interface ParcheggioCreationAttributes extends Optional<ParcheggioAttributes, 'id'> {}

class Parcheggio extends Model<ParcheggioAttributes, ParcheggioCreationAttributes> implements ParcheggioAttributes {
  public id!: number;
  public nome!: string;
  public postiAuto!: number;
  public postiOccupati!: number;
  public oraInizioGiorno!: string;
  public oraFineGiorno!: string;

  // Create (static method)
  public static async createParcheggio(nome: string, postiAuto: number, postiOccupati: number, oraInizioGiorno: string, oraFineGiorno: string): Promise<Parcheggio> {
    return await this.create({ nome, postiAuto, postiOccupati, oraInizioGiorno, oraFineGiorno });
  }

  // Read (instance method)
  public async getInfo(): Promise<ParcheggioAttributes> {
    return await this.toJSON();
  }

  // Update (instance method)
  public async updateParcheggio(nome?: string, postiAuto?: number, postiOccupati?: number, oraInizioGiorno?: string, oraFineGiorno?: string): Promise<void> {
    this.nome = nome || this.nome;
    this.postiAuto = postiAuto || this.postiAuto;
    this.postiOccupati = postiOccupati || this.postiOccupati;
    this.oraInizioGiorno = oraInizioGiorno || this.oraInizioGiorno;
    this.oraFineGiorno = oraFineGiorno || this.oraFineGiorno;
    await this.save();
  }

  // Delete (static method)
  public static async deleteParcheggio(id: number): Promise<void> {
    const parcheggio = await this.findByPk(id);
    if (parcheggio) {
      await parcheggio.destroy();
    }
  }
}

Parcheggio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    postiAuto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'posti_auto', // Define the field name for the database column
    },
    postiOccupati: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'posti_occupati', // Define the field name for the database column
    },
    oraInizioGiorno: {
      type: DataTypes.TIME, // Use DataTypes.TIME for storing time
      allowNull: false,
      field: 'ora_inizio_giorno', // Define the field name for the database column
    },
    oraFineGiorno: {
      type: DataTypes.TIME, // Use DataTypes.TIME for storing time
      allowNull: false,
      field: 'ora_fine_giorno', // Define the field name for the database column
    },
  },
  {
    sequelize,
    tableName: 'parcheggi',
    timestamps: false,
  }
);

export default Parcheggio;
