//  to generate token on the basis of return request.(return response)
const userDbContext = require('../dbAccess/userDbContext');
const { generateToken } = require('../utils/auth');


const register = async function (req) {
    const result = await userDbContext.register(req);
    return result;
};
const login = async function (req) {
    let token = null;
    let userData = null;
    const result = await userDbContext.login(req);
    if (result.success) {
        token = await generateToken(result.data, result.roleDetail);
        userData = result.data;
        return { message: 'Login Successful', data: { token, userData }, success: true }
    }
    return result;
};
const forgotPassword = async function (req) {
    const result = await userDbContext.forgotPassword(req);
    return result;
};
const verifyOtp = async function (req) {
    const result = await userDbContext.verifyOtp(req);
    return result;
};
const resetPassword = async function (req) {
    const result = await userDbContext.resetPassword(req);
    return result;
};
const getUserDetail = async function (req) {
    const result = await userDbContext.getUserDetail(req);
    return result;
};
const getAllUsers = async function (req) {
    const result = await userDbContext.getAllUsers(req);
    return result;
};
const updateUser = async function (req) {
    const result = await userDbContext.updateUser(req);
    return result;
};
const deleteUser = async function (req) {
    const result = await userDbContext.deleteUser(req);
    return result;
};
const addDepartment = async function (req) {
    const result = await userDbContext.addDepartment(req);
    return result;
};
const addDesignation = async function (req) {
    const result = await userDbContext.addDesignation(req);
    return result;
};
const getAllDepartments = async function (req) {
    const result = await userDbContext.getAllDepartments(req);
    return result;
};
const getDesignationsByType = async function (req) {
    const result = await userDbContext.getDesignationsByType(req);
    return result;
};
const updateDesignation = async function (req) {
    const result = await userDbContext.updateDesignation(req);
    return result;
};
const updateDepartment = async function (req) {
    const result = await userDbContext.updateDepartment(req);
    return result;
};
const deleteDepartmentById = async function (req) {
    const result = await userDbContext.deleteDepartmentById(req);
    return result;
};
const deleteDesignationById = async function (req) {
    const result = await userDbContext.deleteDesignationById(req);
    return result;
};
const addLeadStatus = async function (req) {
    const result = await userDbContext.addLeadStatus(req);
    return result;
};
const getAllLeadStatuses = async function (req) {
    const result = await userDbContext.getAllLeadStatuses(req);
    return result;
};
const updateLeadStatus = async function (req) {
    const result = await userDbContext.updateLeadStatus(req);
    return result;
};
const deleteLeadStatus = async function (req) {
    const result = await userDbContext.deleteLeadStatus(req);
    return result;
};
const addLeadSource = async function (req) {
    const result = await userDbContext.addLeadSource(req);
    return result;
};
const getAllLeadSources = async function (req) {
    const result = await userDbContext.getAllLeadSources(req);
    return result;
};
const updateLeadSource = async function (req) {
    const result = await userDbContext.updateLeadSource(req);
    return result;
};
const deleteLeadSource = async function (req) {
    const result = await userDbContext.deleteLeadSource(req);
    return result;
};
const createLead = async function (req) {
    const result = await userDbContext.createLead(req);
    return result;
};
const getLeadDetail = async function (req) {
    const result = await userDbContext.getLeadDetail(req);
    return result;
};
const getAllLeads = async function (req) {
    const result = await userDbContext.getAllLeads(req);
    return result;
};
const updateLead = async function (req) {
    const result = await userDbContext.updateLead(req);
    return result;
};
const deleteLead = async function (req) {
    const result = await userDbContext.deleteLead(req);
    return result;
};
const getCompanySizes = async function (req) {
    const result = await userDbContext.getCompanySizes(req);
    return result;
};
const createCompanyCategory = async function (req) {
    const result = await userDbContext.createCompanyCategory(req);
    return result;
};
const getAllCompanyCategories = async function (req) {
    const result = await userDbContext.getAllCompanyCategories(req);
    return result;
};
const updateCompanyCategory = async function (req) {
    const result = await userDbContext.updateCompanyCategory(req);
    return result;
};
const deleteCompanyCategory = async function (req) {
    const result = await userDbContext.deleteCompanyCategory(req);
    return result;
};
const getDropDownByType = async function (req) {
    const result = await userDbContext.getDropDownByType(req);
    return result;
};
const createDropDown = async function (req) {
    const result = await userDbContext.createDropDown(req);
    return result;
};
const updateDropDown = async function (req) {
    const result = await userDbContext.updateDropDown(req);
    return result;
};
const deleteDropDown = async function (req) {
    const result = await userDbContext.deleteDropDown(req);
    return result;
};
const createLeadTaskCategory = async function (req) {
    const result = await userDbContext.createLeadTaskCategory(req);
    return result;
};
const createLeadTaskSubCategory = async function (req) {
    const result = await userDbContext.createLeadTaskSubCategory(req);
    return result;
};
const getAllLeadTaskCategory = async function (req) {
    const result = await userDbContext.getAllLeadTaskCategory(req);
    return result;
};
const getLeadTaskSubCategoryByType = async function (req) {
    const result = await userDbContext.getLeadTaskSubCategoryByType(req);
    return result;
};
const updateLeadTaskCategory = async function (req) {
    const result = await userDbContext.updateLeadTaskCategory(req);
    return result;
};
const updateLeadTaskSubCategory = async function (req) {
    const result = await userDbContext.updateLeadTaskSubCategory(req);
    return result;
};
const deleteLeadTaskCategory = async function (req) {
    const result = await userDbContext.deleteLeadTaskCategory(req);
    return result;
};
const deleteLeadTaskSubCategory = async function (req) {
    const result = await userDbContext.deleteLeadTaskSubCategory(req);
    return result;
};
const createLeadActionLog = async function (req) {
    const result = await userDbContext.createLeadActionLog(req);
    return result;
};
const getAllLeadActionLogs = async function (req) {
    const result = await userDbContext.getAllLeadActionLogs(req);
    return result;
};
const getAllLeadCount = async function (req) {
    const result = await userDbContext.getAllLeadCount(req);
    return result;
};
const sendMail = async function (req) {
    const result = await userDbContext.sendMail(req);
    return result;
};
const getLeadActivityLogs = async function (req) {
    const result = await userDbContext.getLeadActivityLogs(req);
    return result;
};
const dataForReports = async function (req) {
    const result = await userDbContext.dataForReports(req);
    return result;
};
const downloadReportInExcel = async function (req, res) {
    const result = await userDbContext.downloadReportInExcel(req, res);
    return result;
};
const createActionType = async function (req) {
    const result = await userDbContext.createActionType(req);
    return result;
};
const getAllActionTypes = async function (req) {
    const result = await userDbContext.getAllActionTypes(req);
    return result;
};
const updateActionType = async function (req) {
    const result = await userDbContext.updateActionType(req);
    return result;
};
const deleteActionType = async function (req) {
    const result = await userDbContext.deleteActionType(req);
    return result;
};
const createActionSubType = async function (req) {
    const result = await userDbContext.createActionSubType(req);
    return result;
};
const getActionSubTypesByType = async function (req) {
    const result = await userDbContext.getActionSubTypesByType(req);
    return result;
};
const updateActionSubType = async function (req) {
    const result = await userDbContext.updateActionSubType(req);
    return result;
};
const deleteActionSubType = async function (req) {
    const result = await userDbContext.deleteActionSubType(req);
    return result;
};
const createEmailTemplate = async function (req) {
    const result = await userDbContext.createEmailTemplate(req);
    return result;
};
const getAllEmailTemplates = async function (req) {
    const result = await userDbContext.getAllEmailTemplates(req);
    return result;
};
const getEmailTemplateDetail = async function (req) {
    const result = await userDbContext.getEmailTemplateDetail(req);
    return result;
};
const updateEmailTemplate = async function (req) {
    const result = await userDbContext.updateEmailTemplate(req);
    return result;
};
const deleteEmailTemplate = async function (req) {
    const result = await userDbContext.deleteEmailTemplate(req);
    return result;
};
const downloadSampleExcelForCreateLead = async function (req, res) {
    const result = await userDbContext.downloadSampleExcelForCreateLead(req, res);
    return result;
};
const downloadLeadDataInExcel = async function (req, res) {
    const result = await userDbContext.downloadLeadDataInExcel(req, res);
    return result;
};
const deleteEmailTemplateImage = async function (req, res) {
    const result = await userDbContext.deleteEmailTemplateImage(req, res);
    return result;
};
const createLeadsByExcel = async function (req) {
    const result = await userDbContext.createLeadsByExcel(req);
    return result;
};
const downloadSampleExcelForCreateUser = async function (req, res) {
    const result = await userDbContext.downloadSampleExcelForCreateUser(req, res);
    return result;
};
const createUsersByExcel  = async function (req) {
    const result = await userDbContext.createUsersByExcel(req);
    return result;
};















module.exports = {
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getUserDetail,
    getAllUsers,
    updateUser,
    deleteUser,
    addDepartment,
    addDesignation,
    getAllDepartments,
    getDesignationsByType,
    updateDesignation,
    updateDepartment,
    deleteDepartmentById,
    deleteDesignationById,
    addLeadStatus,
    getAllLeadStatuses,
    updateLeadStatus,
    deleteLeadStatus,
    addLeadSource,
    getAllLeadSources,
    updateLeadSource,
    deleteLeadSource,
    createLead,
    getLeadDetail,
    getAllLeads,
    updateLead,
    deleteLead,
    getCompanySizes,
    createCompanyCategory,
    getAllCompanyCategories,
    updateCompanyCategory,
    deleteCompanyCategory,
    getDropDownByType,
    createDropDown,
    updateDropDown,
    deleteDropDown,
    createLeadTaskCategory,
    createLeadTaskSubCategory,
    getAllLeadTaskCategory,
    getLeadTaskSubCategoryByType,
    updateLeadTaskCategory,
    updateLeadTaskSubCategory,
    deleteLeadTaskCategory,
    deleteLeadTaskSubCategory,
    createLeadActionLog,
    getAllLeadActionLogs,
    getAllLeadCount,
    sendMail,
    getLeadActivityLogs,
    dataForReports,
    downloadReportInExcel,
    createActionType,
    getAllActionTypes,
    updateActionType,
    deleteActionType,
    createActionSubType,
    getActionSubTypesByType,
    updateActionSubType,
    deleteActionSubType,
    createEmailTemplate,
    getAllEmailTemplates,
    getEmailTemplateDetail,
    updateEmailTemplate,
    deleteEmailTemplate,
    downloadSampleExcelForCreateLead,
    downloadLeadDataInExcel,
    deleteEmailTemplateImage,
    createLeadsByExcel,
    downloadSampleExcelForCreateUser,
    createUsersByExcel
};
