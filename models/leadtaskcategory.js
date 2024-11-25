'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeadTaskCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LeadTaskCategory.init({
    name: DataTypes.STRING,
    displayName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LeadTaskCategory',
  });
  return LeadTaskCategory;
};