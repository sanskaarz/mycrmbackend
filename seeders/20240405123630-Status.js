'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Statuses',
      [
        {
          // leads which aren't scheduled yet
          name: 'pending',
          displayName: 'Pending',
          types: 'lead',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
        },
        {
          // leads which are scheduled
          name: 'scheduled',
          displayName: 'Scheduled',
          types: 'lead',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
        },
        {
          // leads which are closed
          name: 'contacted',
          displayName: 'Contacted',
          types: 'lead',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
        },
        {
          //leads which are successfully closed
          name: 'registered',
          displayName: 'Registered',
          types: 'lead',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
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
