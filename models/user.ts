import { Model, DataTypes } from 'sequelize';
import sequelize from './index';

class User extends Model {
  public id!: number;
  public nama_lengkap!: string;
  public username!: string;
  public password!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init({
  nama_lengkap: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'users',
});

export default User;
