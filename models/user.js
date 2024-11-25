'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    profileImage: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    password: DataTypes.STRING,
    roleId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references: {
        model: 'Role',
        key: 'id'
      }
    },
    designationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'DesignationList',
        key: 'id'
      }
    },
    employeeId: {
      type: DataTypes.STRING
    },
    skype: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};