'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Lead.init({
    name: DataTypes.STRING,
    personalMobile: DataTypes.STRING,
    companyMobile: DataTypes.STRING,
    personalEmail: DataTypes.STRING,
    companyEmail: DataTypes.STRING,
    companyName: DataTypes.STRING,
    companySize: {
      type: DataTypes.INTEGER,
      references: {
        model: 'MasterData',
        key: 'id'
      }
    },
    companyTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'CompanyCategory',
        key: 'id'
      }
    },
    personalAddress: DataTypes.STRING,
    companyAddress: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    website: DataTypes.STRING,
    facebook: DataTypes.STRING,
    linkedIn: DataTypes.STRING,
    twitter: DataTypes.STRING,
    budget: DataTypes.STRING,
    leadDurationId:
    {
      type: DataTypes.INTEGER,
      references: {
        model: 'MasterData',
        key: 'id'
      }
    },
    leadSourceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'MasterData',
        key: 'id'
      }
    },
    leadTaskCategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'LeadTaskCategory',
        key: 'id'
      }
    },
    leadTaskSubCategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'LeadTaskSubCategory',
        key: 'id'
      }
    },
    leadStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Status',
        key: 'id'
      }
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    scheduleDate: DataTypes.STRING,
    scheduledTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'MasterData',
        key: 'id'
      }
    },
    description: DataTypes.STRING,
    isTouched: DataTypes.BOOLEAN,
    isDeleted: DataTypes.BOOLEAN,
    deletedByUserName: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Lead',
  });
  return Lead;
};