'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'ActionTypes',
      [
        {
          name: 'call',
          displayName: 'Call',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'email',
          displayName: 'Email',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'directvisit',
          displayName: 'Direct Visit',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
