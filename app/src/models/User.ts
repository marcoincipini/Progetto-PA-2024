// Import necessary modules from 'sequelize'
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Import the database connection from 'DbConnections'
import { DbConnections } from './DbConnections';

// Get the database connection
const sequelize: Sequelize = DbConnections.getConnection();

// Define the attributes for the 'User' model
interface UserAttributes {
    id: number;
    name: string;
    surname: string;
    email: string;
    password: string;
    role: string;
    deletedAt?: Date; // Optional deletedAt attribute for soft deletion
}

// Define the attributes for creating a new 'User' instance
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

// Define the 'User' model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public surname!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public deletedAt?: Date; // Optional deletedAt attribute for soft deletion

    // Method to get user data based on email
    static async getUserData(userEmail: string): Promise<User | null> {
        try {
            const user = await this.findOne({
                where: { email: userEmail }
            });
            return user;
        } catch (err) {
            return null;
        }
    }
}

// Initialize the 'User' model
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
            unique: true, // Email must be unique
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true, // Role can be null
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

// Export the 'User' model
export default User;
