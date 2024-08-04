'use strict';

const { faker } = require('@faker-js/faker');
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];

    for (let i = 0; i < 100; i++) {
      users.push({
        NamaLengkap: faker.person.fullName(),
        Username: faker.internet.userName(), // Ensure unique usernames
        Password: faker.internet.password(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const result = await queryInterface.bulkInsert('users', users, {});
    console.log(result);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
