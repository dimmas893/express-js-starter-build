import { Model, DataTypes } from 'sequelize';
import sequelize from './index';

class SecurityAsymmetricKey extends Model {
  public id!: number;
  public api_key!: string;
  public private_key!: string;
  public public_key!: string;
  public secret!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SecurityAsymmetricKey.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  api_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  private_key: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  public_key: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  secret: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'SecurityAsymmetricKey',
  tableName: 'security_asymmetric_keys',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default SecurityAsymmetricKey;
