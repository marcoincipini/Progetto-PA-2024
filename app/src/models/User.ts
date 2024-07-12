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
    token: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public surname!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public token!: number;
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
            token: {
                type: DataTypes.REAL,
                allowNull: true,
            },
        },
        {
            sequelize: sequelize,
            paranoid:true,
            tableName: 'users',
            deletedAt: 'destroyTime',
        }
    );

export default User;

