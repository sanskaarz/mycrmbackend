'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DepartmentList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DepartmentList.init({
    name: DataTypes.STRING,
    displayName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DepartmentList',
  });
  return DepartmentList;
};