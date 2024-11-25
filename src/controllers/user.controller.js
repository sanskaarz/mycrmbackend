//  to show http status on success, failure
const httpStatus = require('http-status'); // hand
const userManager = require('../businessLogic/userManager');

const register = async function (req, res) {
    await userManager
        .register(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const login = async function (req, res) {
    await userManager
        .login(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const forgotPassword = async function (req, res) {
    await userManager
        .forgotPassword(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const verifyOtp = async function (req, res) {
    await userManager
        .verifyOtp(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const resetPassword = async function (req, res) {
    await userManager
        .resetPassword(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getUserDetail = async function (req, res) {
    await userManager
        .getUserDetail(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllUsers = async function (req, res) {
    await userManager
        .getAllUsers(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateUser = async function (req, res) {
    await userManager
        .updateUser(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteUser = async function (req, res) {
    await userManager
        .deleteUser(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const addDepartment = async function (req, res) {
    await userManager
        .addDepartment(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const addDesignation = async function (req, res) {
    await userManager
        .addDesignation(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllDepartments = async function (req, res) {
    await userManager
        .getAllDepartments(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getDesignationsByType = async function (req, res) {
    await userManager
        .getDesignationsByType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateDesignation = async function (req, res) {
    await userManager
        .updateDesignation(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateDepartment = async function (req, res) {
    await userManager
        .updateDepartment(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteDepartmentById = async function (req, res) {
    await userManager
        .deleteDepartmentById(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteDesignationById = async function (req, res) {
    await userManager
        .deleteDesignationById(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const addLeadStatus = async function (req, res) {
    await userManager
        .addLeadStatus(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllLeadStatuses = async function (req, res) {
    await userManager
        .getAllLeadStatuses(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateLeadStatus = async function (req, res) {
    await userManager
        .updateLeadStatus(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteLeadStatus = async function (req, res) {
    await userManager
        .deleteLeadStatus(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const addLeadSource = async function (req, res) {
    await userManager
        .addLeadSource(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllLeadSources = async function (req, res) {
    await userManager
        .getAllLeadSources(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateLeadSource = async function (req, res) {
    await userManager
        .updateLeadSource(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteLeadSource = async function (req, res) {
    await userManager
        .deleteLeadSource(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const createLead = async function (req, res) {
    await userManager
        .createLead(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getLeadDetail = async function (req, res) {
    await userManager
        .getLeadDetail(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllLeads = async function (req, res) {
    await userManager
        .getAllLeads(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateLead = async function (req, res) {
    await userManager
        .updateLead(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteLead = async function (req, res) {
    await userManager
        .deleteLead(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getCompanySizes = async function (req, res) {
    await userManager
        .getCompanySizes(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const createCompanyCategory = async function (req, res) {
    await userManager
        .createCompanyCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllCompanyCategories = async function (req, res) {
    await userManager
        .getAllCompanyCategories(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateCompanyCategory = async function (req, res) {
    await userManager
        .updateCompanyCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteCompanyCategory = async function (req, res) {
    await userManager
        .deleteCompanyCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getDropDownByType = async function (req, res) {
    await userManager
        .getDropDownByType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const createDropDown = async function (req, res) {
    await userManager
        .createDropDown(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateDropDown = async function (req, res) {
    await userManager
        .updateDropDown(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteDropDown = async function (req, res) {
    await userManager
        .deleteDropDown(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const createLeadTaskCategory = async function (req, res) {
    await userManager
        .createLeadTaskCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const createLeadTaskSubCategory = async function (req, res) {
    await userManager
        .createLeadTaskSubCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllLeadTaskCategory = async function (req, res) {
    await userManager
        .getAllLeadTaskCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getLeadTaskSubCategoryByType = async function (req, res) {
    await userManager
        .getLeadTaskSubCategoryByType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateLeadTaskCategory = async function (req, res) {
    await userManager
        .updateLeadTaskCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateLeadTaskSubCategory = async function (req, res) {
    await userManager
        .updateLeadTaskSubCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteLeadTaskCategory = async function (req, res) {
    await userManager
        .deleteLeadTaskCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteLeadTaskSubCategory = async function (req, res) {
    await userManager
        .deleteLeadTaskSubCategory(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const createLeadActionLog = async function (req, res) {
    await userManager
        .createLeadActionLog(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllLeadActionLogs = async function (req, res) {
    await userManager
        .getAllLeadActionLogs(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllLeadCount = async function (req, res) {
    await userManager
        .getAllLeadCount(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const sendMail = async function (req, res) {
    await userManager
        .sendMail(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getLeadActivityLogs = async function (req, res) {
    await userManager
        .getLeadActivityLogs(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const dataForReports = async function (req, res) {
    await userManager
        .dataForReports(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const downloadReportInExcel = async function (req, res) {
    await userManager
        .downloadReportInExcel(req, res)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        });
};
const createActionType = async function (req, res) {
    await userManager
        .createActionType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getAllActionTypes = async function (req, res) {
    await userManager
        .getAllActionTypes(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateActionType = async function (req, res) {
    await userManager
        .updateActionType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteActionType = async function (req, res) {
    await userManager
        .deleteActionType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });

};
const createActionSubType = async function (req, res) {
    await userManager
        .createActionSubType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getActionSubTypesByType = async function (req, res) {
    await userManager
        .getActionSubTypesByType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateActionSubType = async function (req, res) {
    await userManager
        .updateActionSubType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteActionSubType = async function (req, res) {
    await userManager
        .deleteActionSubType(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const createEmailTemplate = async function (req, res) {
    await userManager
        .createEmailTemplate(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};

const getAllEmailTemplates = async function (req, res) {
    await userManager
        .getAllEmailTemplates(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const getEmailTemplateDetail = async function (req, res) {
    await userManager
        .getEmailTemplateDetail(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const updateEmailTemplate = async function (req, res) {
    await userManager
        .updateEmailTemplate(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const deleteEmailTemplate = async function (req, res) {
    await userManager
        .deleteEmailTemplate(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        });
};
const downloadSampleExcelForCreateLead = async function (req, res) {
    await userManager
        .downloadSampleExcelForCreateLead(req, res)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        });
};
const downloadLeadDataInExcel = async function (req, res) {
    await userManager
        .downloadLeadDataInExcel(req, res)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        });
};
const deleteEmailTemplateImage = async function (req, res) {
    await userManager
        .deleteEmailTemplateImage(req)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        });
};
const createLeadsByExcel = async function (req, res) {
    await userManager
        .createLeadsByExcel(req, res)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        });
};
const downloadSampleExcelForCreateUser = async function (req, res) {
    await userManager
        .downloadSampleExcelForCreateUser(req, res)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        });
};
const createUsersByExcel = async function (req, res) {
    await userManager
        .createUsersByExcel(req, res)
        .then((response) => {
            res.status(httpStatus.OK).send(response);
        })
        .catch((err) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        });
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
    deleteEmailTemplateImage,
    downloadSampleExcelForCreateLead,
    downloadLeadDataInExcel,
    createLeadsByExcel,
    downloadSampleExcelForCreateUser,
    createUsersByExcel
};;
