'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'ActionSubTypes',
      [
        {
          name: 'callmade-contacted',
          displayName: 'Call Made - Contacted',
          actionTypeId: '1',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'callmade-notcontacted',
          displayName: 'Call Made - Not Contacted',
          actionTypeId: '1',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'wrongnumber',
          displayName: 'Wrong Number',
          actionTypeId: '1',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'callreceived',
          displayName: 'Call Received',
          actionTypeId: '1',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'emailsent',
          displayName: 'Email Sent',
          actionTypeId: '2',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'emailreceived',
          displayName: 'Email Received',
          actionTypeId: '2',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'ivisited',
          displayName: 'I Visited',
          actionTypeId: '3',
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'clientvisited',
          displayName: 'Client Visited',
          actionTypeId: '3',
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
