'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LeadActionLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      leadId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Leads',
          key: 'id'
        }
      },
      actionTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ActionTypes',
          key: 'id'
        }
      },
      actionSubTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ActionSubTypes',
          key: 'id'
        }
      },
      logDescription: {
        type: Sequelize.STRING
      },
      assignedEmployeeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      leadStatusId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'MasterData',
          key: 'id'
        }
      },
      isDeleted: {
        type: Sequelize.BOOLEAN
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
    LeadActionLogs
  }
};