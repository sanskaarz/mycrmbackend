'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActionSubType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ActionSubType.init({
    name: DataTypes.STRING,
    displayName: DataTypes.STRING,
    actionTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ActionType',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'ActionSubType',
  });
  return ActionSubType;
};