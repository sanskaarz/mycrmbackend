'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmailTemplateAttachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmailTemplateAttachment.init({
    attachment: DataTypes.STRING,
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EmailTemplate',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'EmailTemplateAttachment',
  });
  return EmailTemplateAttachment;
};