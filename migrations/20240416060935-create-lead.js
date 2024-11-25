'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Leads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      personalMobile: {
        type: Sequelize.STRING
      },
      companyMobile: {
        type: Sequelize.STRING
      },
      personalEmail: {
        type: Sequelize.STRING
      },
      companyEmail: {
        type: Sequelize.STRING
      },
      companyName: {
        type: Sequelize.STRING
      },
      companySize: {
        type: Sequelize.INTEGER,
        references: {
          model: 'MasterData',
          key: 'id'
        }
      },
      companyTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'CompanyCategories',
          key: 'id'
        }
      },
      personalAddress: {
        type: Sequelize.STRING
      },
      companyAddress: {
        type: Sequelize.STRING
      },
      postalCode: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      facebook: {
        type: Sequelize.STRING
      },
      linkedIn: {
        type: Sequelize.STRING
      },
      twitter: {
        type: Sequelize.STRING
      },
      budget: {
        type: Sequelize.STRING
      },
      leadDurationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'MasterData',
          key: 'id'
        }
      },
      leadSourceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'MasterData',
          key: 'id'
        }
      },
      leadTaskCategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'LeadTaskCategories',
          key: 'id'
        }
      },
      leadTaskSubCategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'LeadTaskSubCategories',
          key: 'id'
        }
      },
      leadStatusId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Statuses',
          key: 'id'
        }
      },
      assignedToId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      scheduleDate: {
        type: Sequelize.STRING
      },
      scheduledTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'MasterData',
          key: 'id'
        }
      },
      description: {
        type: Sequelize.STRING
      },
      isTouched: {
        type: Sequelize.BOOLEAN
      },
      isDeleted: {
        type: Sequelize.BOOLEAN
      },
      deletedByUserName: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Leads');
  }
};