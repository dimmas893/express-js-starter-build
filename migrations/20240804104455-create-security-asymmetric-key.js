module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('security_asymmetric_keys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      api_key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      private_key: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      public_key: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      secret: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('security_asymmetric_keys');
  }
};
