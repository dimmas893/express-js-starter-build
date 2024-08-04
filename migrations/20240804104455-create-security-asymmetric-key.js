module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('security_Asymmetric_keys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      APIKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      PrivateKey: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      PublicKey: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      Secret: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SecurityAsymmetricKeys');
  }
};
