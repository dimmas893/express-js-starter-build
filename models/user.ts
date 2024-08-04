import { Model, DataTypes } from 'sequelize';
import sequelize from './index';

class User extends Model {
  public id!: number;
  public NamaLengkap!: string;
  public Username!: string;
  public Password!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  NamaLengkap: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
});

export default User;
