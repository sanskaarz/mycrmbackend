'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'Super Admin',
          email: 'admin@yopmail.com',
          mobile: '9876543210',
          password: '$2a$12$BKYkb1XjfAa/V3oB4qmMNOB6D35OD5bc86F85C1RDCUE5YU3afAjS',
          roleId: 1,
          designationId: 2,
          employeeId: '#00111',
          skype: 'http://skype.snskr.com',
          address: 'Office 14, Tricity Plaza, Zirakpur',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
        },
        {
          name: 'Salman Khan',
          email: 'salman@yopmail.com',
          mobile: '9876543210',
          password: '$2a$12$IQ1c1aCEgmcFrS7qE4ZCE.AM3kMcMbWejudQY5xB9a5DiAhQLHP2u',
          roleId: 2,
          designationId: 2,
          employeeId: '#00112',
          skype: 'http://skype.snskr.com',
          address: 'IPS College, Gwalior',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
        },
      ],
      {}
    )
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
