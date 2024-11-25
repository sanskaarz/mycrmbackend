'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeadActionLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LeadActionLog.init({
    leadId: {
      type: DataTypes.INTEGER,
      references: {
        model:  'Lead',
        key: 'id'
    }
    },
    // for filtering audit logs by action type
    actionTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ActionType',
        key: 'id'
      }
    },
    actionSubTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ActionSubType',
        key: 'id'
      }
    },
    logDescription: DataTypes.STRING,
    assignedEmployeeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    leadStatusId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'MasterData',
        key: 'id'
      }
    },
    isDeleted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'LeadActionLog',
  });
  return LeadActionLog;
};