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
            tableName: 'users',
            timestamps: false,
        }
    );

export default User;
