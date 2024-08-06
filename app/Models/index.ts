import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('nodejs', 'root', 'Anandadimmas,123', {
  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;
