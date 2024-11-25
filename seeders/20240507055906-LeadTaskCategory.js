'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'LeadTaskCategories',
      [
        {
          name: 'webdevelopment',
          displayName: 'Web Development',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'mobileappdevelopment',
          displayName: 'Mobile App Development',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'softwaredevelopment',
          displayName: 'Software Development',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'itinfrastructure',
          displayName: 'IT Infrastructure',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'itsercurity',
          displayName: 'IT Security',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'digitalmarketing',
          displayName: 'Digital Marketing',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },

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
