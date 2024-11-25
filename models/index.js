'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.User.belongsTo(db.Role, { foreignKey: 'roleId' })
db.User.belongsTo(db.DesignationList, { as: 'Designation', foreignKey: 'designationId' })
db.DesignationList.belongsTo(db.DepartmentList, { as: 'Department', foreignKey: 'departmentId' })
db.Lead.belongsTo(db.MasterData, { as: 'LeadSource', foreignKey: 'leadSourceId' })
db.Lead.belongsTo(db.LeadTaskCategory, { as: 'LeadTaskCategory', foreignKey: 'leadTaskCategoryId' })
db.Lead.belongsTo(db.Status, { as: 'LeadStatus', foreignKey: 'leadStatusId' })
db.Lead.belongsTo(db.User, { as: 'AssignedTo', foreignKey: 'assignedToId' })
// db.Lead.belongsTo(db.User, { as: 'DeletedByUserName', foreignKey: 'deletedByUserId' })
db.Lead.belongsTo(db.CompanyCategory, { as: 'CompanyCategory', foreignKey: 'companyTypeId' })
db.Lead.belongsTo(db.LeadTaskSubCategory, { as: 'LeadTaskSubCategory', foreignKey: 'leadTaskSubCategoryId' })
db.Lead.belongsTo(db.MasterData, { as: 'CompanySize', foreignKey: 'companySize' })
db.LeadTaskSubCategory.belongsTo(db.LeadTaskCategory, { as: 'LeadTaskCategories', foreignKey: 'leadTaskCategoryId' })
db.LeadActionLog.belongsTo(db.Lead, { as: 'LeadDetail', foreignKey: 'leadId' })
db.LeadActionLog.belongsTo(db.MasterData, { as: 'LeadTemperatureStatus', foreignKey: 'leadStatusId' })
db.LeadActionLog.belongsTo(db.User, { as: 'AssignedEmployee', foreignKey: 'assignedEmployeeId' })
db.Lead.belongsTo(db.MasterData, { as: 'ScheduledType', foreignKey: 'scheduledTypeId' })
db.Lead.belongsTo(db.MasterData, { as: 'LeadDuration', foreignKey: 'leadDurationId' })
db.Lead.hasMany(db.LeadActionLog, { as: 'LeadActionLog', foreignKey: 'leadId' })
db.LeadActivityLog.belongsTo(db.Lead, { as: 'LeadInfo', foreignKey: 'leadId' })
db.LeadActionLog.belongsTo(db.ActionType, { as: 'ActionTypes', foreignKey: 'actionTypeId' })
db.LeadActionLog.belongsTo(db.ActionSubType, { as: 'ActionSubType', foreignKey: 'actionSubTypeId' })
db.ActionSubType.belongsTo(db.ActionType, { as: 'ActionType', foreignKey: 'actionTypeId' })
db.EmailTemplate.hasMany(db.EmailTemplateAttachment, { as: 'EmailTemplateAttachment', foreignKey: 'templateId' })
db.User.hasMany(db.LeadActionLog, { as: 'LeadActionLogs', foreignKey: 'assignedEmployeeId' })


module.exports = db;
