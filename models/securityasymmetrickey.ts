import { Model, DataTypes } from 'sequelize';
import sequelize from './index';

class SecurityAsymmetricKey extends Model {
  public id!: number;
  public APIKey!: string;
  public PrivateKey!: string;
  public PublicKey!: string;
  public Secret!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SecurityAsymmetricKey.init({
  APIKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  PrivateKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  PublicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Secret: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'SecurityAsymmetricKey',
});

export default SecurityAsymmetricKey;
