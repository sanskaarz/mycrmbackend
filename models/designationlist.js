'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DesignationList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DesignationList.init({
    name: DataTypes.STRING,
    displayName: DataTypes.STRING,
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references: {
        model: 'DepartmentList',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'DesignationList',
  });
  return DesignationList;
};