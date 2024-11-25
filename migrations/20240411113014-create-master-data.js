'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MasterData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      displayName: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      types: {
        type: Sequelize.ENUM(
          'leadSource',
          'companySize',
          'leadStatus',// like hot, warm, cold, etc.
          'scheduledType',// for schedule dropdown in/after lead action
          'leadDuration',
        )
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MasterData');
  }
};