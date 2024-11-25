'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'DesignationLists',
      [
        {
          name: 'frontenddeveloper',
          displayName: 'FrontEnd-Developer',
          departmentId: 1,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'backenddeveloper',
          displayName: 'BackEnd-Developer',
          departmentId: 1,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'fullstackdeveloper',
          displayName: 'FullStack-Developer',
          departmentId: 1,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'fieldsales',
          displayName: 'Field-Sales',
          departmentId: 4,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'enterprisesales',
          displayName: 'Enterprise-Sales',
          departmentId: 4,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'hrmanager',
          displayName: 'HR-Manager',
          departmentId: 3,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'hrexecutive',
          displayName: 'HR-Executive',
          departmentId: 3,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'hrassistant',
          displayName: 'HR-Assistant',
          departmentId: 3,
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
