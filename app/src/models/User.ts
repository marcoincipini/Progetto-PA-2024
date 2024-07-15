import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DbConnections } from './DbConnections';

const sequelize : Sequelize = DbConnections.getConnection();

interface UserAttributes {
    id: number;
    name: string;
    surname: string;
    email: string;
    password: string;
    role: string;
    deletedAt?: Date; // Optional deletedAt attribute for paranoid
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public surname!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public deletedAt?: Date; // Optional deletedAt attribute for paranoid
    //get user data
    static async getUserData(userEmail:string): Promise<User | null> {
        
    try {
        const user = await this.findOne({
            where: { email: userEmail }
        });
        return user;
    } catch (error) {
        console.error('Errore durante il recupero dei dati utente:', error);
        return null;
        }
    }   
}

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            surname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'deleted_at', // Define the field name for the database column
              },
        },
        {
            sequelize: sequelize,
            tableName: 'users',
            paranoid: true, // Enable soft delete
            createdAt: false, // Disable createdAt since we are not using it
            updatedAt: false, // Disable updatedAt since we are not using it
            deletedAt: 'deleted_at', // Specify the field name for the deletedAt attribute
        }
    );

export default User;

