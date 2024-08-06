import express from 'express';
import sequelize from '../models';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import securityRoutes from '../routes/securityasymmetrickey';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/security-keys', securityRoutes); // Use router with prefix
const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    app.use(securityRoutes);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error('Unable to connect to the database:', err);
  });
