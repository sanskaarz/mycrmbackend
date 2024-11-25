'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeadActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LeadActivityLog.init({
    leadId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Lead',
        key: 'id'
      }
    },
    activityDetail: DataTypes.STRING,
    whichColumnChanged: DataTypes.STRING,
    doneByUserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    doneByUserName: DataTypes.STRING,
    isDeleted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'LeadActivityLog',
  });
  return LeadActivityLog;
};