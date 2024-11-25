'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeadTaskSubCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LeadTaskSubCategory.init({
    name: DataTypes.STRING,
    displayName: DataTypes.STRING,
    leadTaskCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LeadTaskCategory',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'LeadTaskSubCategory',

  });
  return LeadTaskSubCategory;
};