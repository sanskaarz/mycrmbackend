const bcrypt = require('bcryptjs')
const Sequelize = require('sequelize');
const moment = require('moment');
const fs = require('fs');
const excelJS = require('exceljs');
const XLSX = require('xlsx');
const path = require('path');
const baseDirectoryPath = path.resolve();
const imageDirectory = path.resolve(baseDirectoryPath, 'uploadedImages');
const profilePictureDirectory = path.resolve(imageDirectory, 'profilePictures');
const mailAttachmentsDirectory = path.resolve(imageDirectory, 'mailAttachments');
const mailTemplateAttachmentsDirectory = path.resolve(imageDirectory, 'mailTemplateAttachments');
const nodemailer = require('nodemailer');
const { sequelize, User, Role, Status, MasterData, DepartmentList, DesignationList, CompanyCategory, Lead, LeadTaskCategory, LeadTaskSubCategory, LeadActivityLog, LeadActionLog, ActionType, ActionSubType, EmailTemplate, EmailTemplateAttachment, OtpForUserVerification } = require('../../models')
const { defaultRoles, defaultStatus, actionTypes, actionSubTypes } = require('../utils/helper');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

const writeFiles = async (file, targetDirectory) => {
    if (!fs.existsSync(imageDirectory)) {
        await fs.promises.mkdir(imageDirectory);
    }
    if (fs.existsSync(mailAttachmentsDirectory)) {
        await fs.promises.rm(mailAttachmentsDirectory, { recursive: true, force: true });
    }
    if (!fs.existsSync(mailAttachmentsDirectory)) {
        await fs.promises.mkdir(mailAttachmentsDirectory);
    }
    if (!fs.existsSync(mailTemplateAttachmentsDirectory)) {
        await fs.promises.mkdir(mailTemplateAttachmentsDirectory);
    }
    if (!fs.existsSync(profilePictureDirectory)) {
        await fs.promises.mkdir(profilePictureDirectory);
    }
    if (file && file.length > 0) {
        await Promise.all(
            file.map(async (file) => {
                await fs.promises.writeFile(path.resolve(targetDirectory, file.originalname), file.buffer);
            })
        );
    } else if (file) {
        await fs.promises.writeFile(path.resolve(targetDirectory, file.originalname), file.buffer);
    }
};
// assuming that image always comes with a unique name(renamed by frontend)
const deleteFiles = async (targetDirectory, imageNames) => {
    if (imageNames && Array.isArray(imageNames)) {
        await Promise.all(
            imageNames.map(async (imageName) => {
                if (fs.existsSync(path.resolve(targetDirectory, imageName))) {
                    await fs.promises.unlink(path.resolve(targetDirectory, imageName));
                };
            })
        );
    } else if (imageNames) {
        if (fs.existsSync(path.resolve(targetDirectory, imageNames))) {
            await fs.promises.unlink(path.resolve(targetDirectory, imageNames));
        };
    };
};
// to convert excel date number to iso date
// don't remove this function, it is used somewhere
// function ExcelDateToJSDate(serial) {
//     const step = new Date().getTimezoneOffset() <= 0 ? 25567 + 2 : 25567 + 1;
//     const utc_days = Math.floor(serial - step);
//     const utc_value = utc_days * 86400;
//     const date_info = new Date(utc_value * 1000);
//     const fractional_day = serial - Math.floor(serial);
//     const total_seconds = 86400 * fractional_day;
//     const milliseconds = Math.round((total_seconds % 1) * 1000);
//     const total_whole_seconds = Math.floor(total_seconds);
//     const seconds = total_whole_seconds % 60;
//     const total_minutes = Math.floor(total_whole_seconds / 60);
//     const minutes = total_minutes % 60;
//     const hours = Math.floor(total_minutes / 60);

//     return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds, milliseconds);
// }
function convertToIST(dataString) {
    const date = new Date(dataString);
    const istDateString = date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istDateString);
    const istDateFormatted = istDate.toISOString();
    return istDateFormatted;
};
const dateInDdMmYyyy = dataString => {
    const options = { timeZone: "Asia/Kolkata", day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString("en-GB", options);
};
function dateInYyyyMmDd() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    return currentDate;
};
const register = async (req) => {
    try {
        body = JSON.parse(req.body.profileData)
        const profileImage = req.file;
        let emails = body.email?.toLowerCase()
        let roleDetails;
        const user = await User.findOne({
            where: { email: emails }
        });
        if (body.isAdmin) {
            roleDetails = await Role.findOne({
                where: { key: defaultRoles.admin }
            })
        } else {
            roleDetails = await Role.findOne({
                where: { key: defaultRoles.user }
            })
        }
        if (user) {
            return {
                success: false,
                data: null,
                message: 'Email already exists. Please enter a different Email'
            };
        };
        let designationDetail;
        if (body.department) {
            const departmentDetails = await DepartmentList.findOne({
                where: { name: body.department }
            });
            if (body.designation) {
                designationDetail = await DesignationList.findOne({
                    where: { name: body.designation, departmentId: departmentDetails.id }
                })
            };
        };
        const hashedPassword = await bcrypt.hash(body.password, 12);
        if (profileImage) {
            await writeFiles(profileImage, profilePictureDirectory);
            body.profileImage = profileImage.originalname;
        }
        const newUser = await User.create({
            profileImage: body.profileImage,
            name: body.name,
            email: emails,
            mobile: body.mobile,
            password: hashedPassword,
            roleId: roleDetails.id,
            designationId: designationDetail?.id,
            employeeId: body.employeeId,
            skype: body.skype,
            address: body.address,
            active: true
        });
        return {
            success: true,
            data: newUser,
            message: body.isAdmin ? 'Admin Registered Successfully' : 'User Registered Successfully',
        };
    } catch (error) {
        console.log(error, "Error  in Register API");
        throw new Error(error);
    };
};
const login = async (req) => {
    try {
        const body = req.body;
        let emails = body.email?.toLowerCase()
        const user = await User.findOne({
            where: { email: emails }
        });
        if (!user) {
            return {
                success: false,
                data: null,
                message: {
                    user: 'Email does not exist. Please enter a valid Email',
                },
            };
        };
        if (!user.active) {
            return {
                success: false,
                data: null,
                message: 'This account is not active. Please contact an administrator!',
            };
        };
        const isPasswordEqual = await bcrypt.compare(body.password, user.password);
        if (!isPasswordEqual) {
            return {
                success: false,
                data: null,
                message: {
                    password: 'You have entered a wrong password. Please Recheck your credentials.',
                },
            };
        }

        const roleDetail = await Role.findOne({
            where: { id: user.roleId }
        });

        const userData = await User.findOne({
            where: { id: user.id },
            include: [{
                model: Role,
                required: false
            }],
            attributes: { exclude: ['password'] }
        });


        return {
            success: true,
            data: userData,
            roleDetail,
            message: 'Login Successful',
        };
    } catch (error) {
        console.log(error, "Error in login API");
        throw new Error(error);
    }
};
const forgotPassword = async (req) => {
    try {
        let emails = req.body.email?.toLowerCase()
        const user = await User.findOne({
            where: { email: emails }
        });
        if (!user) {
            return {
                success: false,
                data: null,
                message: 'Email does not exist. Please enter a valid Email',
            };
        };
        const roleDetail = await Role.findOne({
            where: { id: user.roleId }
        });
        if (roleDetail.key !== defaultRoles.admin) {
            return {
                success: false,
                data: null,
                message: 'You are not authorized to reset password. Please contact an administrator!',
            };
        };
        const otp = Math.floor(100000 + Math.random() * 900000);
        const findOtpData = await OtpForUserVerification.findOne({
            where: { userId: user.id }
        });
        if (findOtpData) {
            await OtpForUserVerification.destroy({
                where: { userId: user.id }
            });
        };
        await OtpForUserVerification.create({
            userId: user.id,
            otp: otp
        });
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        const mailOptions = {
            from: '"MyCrm Instep Technologies" < ' + process.env.EMAIL + '>',
            to: emails,
            subject: 'OTP for Password Reset',
            html: `<!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Template</title>

            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        </head>

        <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
            <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #eaeaed; background-image: url(https://i.ibb.co/QP5QnHp/Dark-Blue-Gradient-Background.jpg); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 14px; color: #434343;">

                <header>
                    <table style="width: 100%;">
                        <tbody>
                            <tr style="height: 0;">
                                <td>
                                    <img alt="" src="https://insteptechnologies.com/wp-content/uploads/2023/10/header-new-logo.png" height="50px" />
                                </td>
                                <td style="text-align: right;">
                                    <span style="font-size: 16px; line-height: 30px; color: #ffffff;">${formattedDate}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </header>

                <main>
                    <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
                        <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">
                                Hey ${user.name},
                            </h1>
                            <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
                                Use the following OTP to complete the procedure to change your account password. OTP is valid for
                                <span style="font-weight: 600; color: #1f1f1f;">5 minutes</span>.
                                <br>
                                <br>
                                Do not share this code with others, including Instep employees.
                            </p>
                            <p style="margin: 0; margin-top: 60px; font-size: 40px; font-weight: 600; letter-spacing: 25px; color: #ba3d4f;">
                                ${otp}
                            </p>
                        </div>
                    </div>

                    <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #3b3838;">
                        Need help? Ask at
                        <a href="mailto:office@insteptechnologies.com" style="color: #499fb6; text-decoration: none;">office@insteptechnologies.com</a>
                        or visit our
                        <a href="https://insteptechnologies.com/contact-us/" target="_blank" style="color: #499fb6; text-decoration: none;">Contact Us Page</a>
                    </p>
                </main>

                <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
                    <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #FA6100;">
                        Instep Technologies
                    </p>
                    <p style="margin: 0; margin-top: 14px; color: #434343; font-weight: bold;"></p>
                    Tricity Plaza, Office No. 14-15, Ground Floor, Peer Muchalla, Zirakpur, Punjab 140603
                    </p>
                    <div style="margin: 0; margin-top: 16px;">
                        <a href="https://www.facebook.com/Insteptechnologies/" target="_blank" style="display: inline-block;">
                            <img width="36px" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" />
                        </a>
                        <a href="https://www.instagram.com/insteptechnologies/" target="_blank" style="display: inline-block; margin-left: 8px;">
                            <img width="36px" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" />
                        </a>
                        <a href="https://twitter.com/Instepoffice" target="_blank" style="display: inline-block; margin-left: 8px;">
                            <img width="36px" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" />
                        </a>
                        <a href="https://www.youtube.com/channel/UCfV7VaukypCq4h9uZKhAIOQ" target="_blank" style="display: inline-block; margin-left: 8px;">
                            <img width="36px" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube" />
                        </a>
                    </div>
                    <p style="margin: 0; margin-top: 16px; color: #434343;">
                        Copyright © 2024 InStep Technologies All Rights Reserved.
                    </p>
                </footer>
            </div>
        </body>

        </html>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error, "Mail sending error");
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        return {
            success: true,
            // data: otpData,
            message: 'OTP Sent Successfully',
        };
    } catch (error) {
        console.log(error, "Error in forgotPassword API");

        throw new Error(error);
    }
};
const verifyOtp = async (req) => {
    try {
        const body = req.body;
        const emails = body.email?.toLowerCase()
        const userDetail = await User.findOne({
            where: { email: emails }
        });
        if (!userDetail) {
            return {
                success: false,
                data: null,
                message: 'Email does not exist. Please enter a valid Email',
            };
        };
        const otpData = await OtpForUserVerification.findOne({
            where: { userId: userDetail.id }
        });
        if (!otpData) {
            return {
                success: false,
                data: null,
                message: 'Please generate OTP first',
            };
        };
        if (otpData.otp !== body.otp) {
            return {
                success: false,
                data: null,
                message: 'Invalid OTP. Please enter a valid OTP',
            };
        };
        await OtpForUserVerification.destroy({
            where: { userId: userDetail.id }
        });
        return {
            success: true,
            data: userDetail,
            message: 'OTP Verified Successfully',
        };
    } catch (error) {
        console.log(error, "Error in verifyOtp API");
        throw new Error(error);
    }
};
const resetPassword = async (req) => {
    try {
        const body = req.body;
        const userDetail = await User.findOne({
            where: { id: body.id }
        });
        if (!userDetail) {
            return {
                success: false,
                data: null,
                message: 'User id does not exist. Please enter a valid UserId',
            };
        };
        const hashedPassword = await bcrypt.hash(body.password, 12);
        const data = await User.update({
            password: hashedPassword
        }, {
            where: { id: userDetail.id },
            // returning: true
        });
        return {
            success: true,
            // data: data,
            message: 'Password Reset Successfully',
        };
    } catch (error) {
        console.log(error, "Error in resetPassword API");
        throw new Error(error);
    }
};
const getAllUsers = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        let roleDetails;
        if (body.isAdmin) {
            roleDetails = await Role.findOne({
                where: { key: defaultRoles.admin }
            })
        } else {
            roleDetails = await Role.findOne({
                where: { key: defaultRoles.user }
            })
        }
        let where = {}
        where['roleId'] = roleDetails.id
        if (body.departmentType) {
            const departmentDetail = await DepartmentList.findOne({
                where: { name: body.departmentType }
            });
            const designationData = await DesignationList.findAll({
                where: { departmentId: departmentDetail.id }
            });
            where['designationId'] = { [Sequelize.Op.in]: designationData.map((data) => data.id) }
        }
        if (body.active) {
            where['active'] = body.active;
        }
        const users = await User.findAndCountAll({
            where,
            include: [
                {
                    model: Role,
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: DesignationList,
                    required: false,
                    as: 'Designation',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    include: [
                        {
                            model: DepartmentList,
                            required: false,
                            as: 'Department',
                            attributes: { exclude: ['createdAt', 'updatedAt'] }
                        }
                    ]
                }
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        return {
            success: true,
            data: users,
            message: 'Users Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllUsers API");
        throw new Error(error);
    }
};
const getUserDetail = async (req) => {
    try {
        const body = req.body;
        const userDetail = await User.findOne({
            where: { id: body.id },
            include: [
                {
                    model: Role,
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: DesignationList,
                    required: false,
                    as: 'Designation',
                    include: [
                        {
                            model: DepartmentList,
                            required: false,
                            as: 'Department',
                            attributes: { exclude: ['createdAt', 'updatedAt'] }
                        }
                    ],
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }
            ]
        });
        if (!userDetail) {
            return {
                success: false,
                data: null,
                message: 'User does not exist. Please enter a valid UserId',
            };
        }
        return {
            success: true,
            data: userDetail,
            message: 'User Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getUserDetails API");
        throw new Error(error);
    }
}
const updateUser = async (req) => {
    try {
        const body = JSON.parse(req.body.profileData);
        const emails = body.email?.toLowerCase()
        const profileImage = req.file;
        let roleDetails;
        const user = await User.findOne({
            where: { id: body.id }
        });
        if (!user) {
            return {
                success: false,
                data: null,
                message: 'User does not exist. Please enter a valid User',
            };
        }
        let userDetail;
        if (emails) {
            userDetail = await User.findOne({
                where: { email: emails }
            });
        }
        if (userDetail && userDetail.id != body.id) {
            return {
                success: false,
                data: null,
                message: 'This Email is already assigned to someone. Please enter a different Email',
            };
        }
        if (body.isAdmin) {
            roleDetails = await Role.findOne({
                where: { key: defaultRoles.admin }
            })
        } else if (!body.isAdmin) {
            roleDetails = await Role.findOne({
                where: { key: defaultRoles.user }
            })
        }
        let designationDetail;
        if (body.department) {
            const departmentDetails = await DepartmentList.findOne({
                where: { name: body.department }
            });
            designationDetail = await DesignationList.findOne({
                where: { name: body.designation, departmentId: departmentDetails.id }
            });
        }
        if (profileImage) {
            await writeFiles(profileImage, profilePictureDirectory);
            if (user.profileImage && user.profileImage !== profileImage.originalname) {
                await deleteFiles(profilePictureDirectory, user.profileImage)
            }
            body.profileImage = profileImage.originalname;
        };
        let hashedPassword;
        if (body.password) {
            hashedPassword = await bcrypt.hash(body.password, 12);
        };
        const updatedUser = await User.update({
            profileImage: body.profileImage,
            name: body.name,
            email: emails,
            mobile: body.mobile,
            password: hashedPassword,
            designationId: designationDetail?.id,
            employeeId: body.employeeId,
            roleId: roleDetails.id,
            skype: body.skype,
            address: body.address,
            active: body.active
        }, {
            where: { id: body.id }, returning: true
        },);
        return {
            success: true,
            data: updatedUser,
            message: 'User Updated Successfully',
        };
    } catch (error) {
        console.log(error, "Error in updateUser API");
        throw new Error(error);
    }
};
const deleteUser = async (req) => {
    try {
        const body = req.body;
        const user = await User.findOne({
            where: { id: body.id }
        });
        if (!user) {
            return {
                success: false,
                data: null,
                message: 'User does not exist. Please enter a valid User'
            };
        }
        const leads = await Lead.findOne({
            where: { assignedToId: user.id }
        });
        if (leads) {
            return{
                success: false,
                data:null,
                message:`User is assigned to lead id= ${leads.id}.Please reassign the lead to delete the user.`
            }
        }
        const deletedUser = await User.destroy({
            where: { id: body.id }
        });
        await deleteFiles(profilePictureDirectory, user.profileImage);
        return {
            success: true,
            data: deletedUser,
            message: 'User Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteUser API");
        throw new Error(error);
    }
};
const addDepartment = async (req) => {
    try {
        const body = req.body;
        const departmentDetail = await DepartmentList.findOne({
            where: { name: body.departmentName }
        });
        if (departmentDetail) {
            return {
                success: false,
                data: null,
                message: 'Department already exists. Please enter a different Department',

            };
        } else {
            const newDepartment = await DepartmentList.create({
                name: body.departmentName,
                displayName: body.departmentDisplayName
            });
            return {
                success: true,
                data: newDepartment,
                message: 'Department Added Successfully'
            };
        }
    } catch (error) {
        console.log(error, "Error in addDepartment API");
        throw new Error(error);
    }
};
const addDesignation = async (req) => {
    try {
        const body = req.body;
        const departmentDetail = await DepartmentList.findOne({
            where: { name: body.departmentName }
        });
        if (!departmentDetail) {
            return {
                success: false,
                data: null,
                message: 'Department does not exist. Please enter a valid Department Name'
            };
        }
        const designationDetail = await DesignationList.findOne({
            where: { name: body.designationName, departmentId: departmentDetail.id }
        });
        if (designationDetail) {
            return {
                success: false,
                data: null,
                message: 'Designation already exists. Please enter a different Designation'
            };
        } else {
            const newDesignation = await DesignationList.create({
                name: body.designationName,
                displayName: body.designationDisplayName,
                departmentId: departmentDetail.id
            });
            return {
                success: true,
                data: newDesignation,
                message: 'Designation Added Successfully'
            };
        }
    }
    catch (error) {
        console.log(error, "Error in addDesignation API");
        throw new Error(error);
    }
};
const getAllDepartments = async (req) => {
    try {
        const departmentTypes = await DepartmentList.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']]
        });
        return {
            success: true,
            data: departmentTypes,
            message: 'All Department Types Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllDepartments API");
        throw new Error(error);
    }
};
const getDesignationsByType = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        let where = {};
        if (body.departmentType) {
            const departmentDetails = await DepartmentList.findOne({
                where: { name: body.departmentType }
            });
            where = { departmentId: departmentDetails?.id }
        }
        const designationTypes = await DesignationList.findAndCountAll({
            where: where,
            include: [{
                model: DepartmentList,
                required: false,
                as: 'Department',
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        if (!designationTypes) {
            return {
                success: false,
                data: null,
                message: 'No Designations Found',
            };
        }
        return {
            success: true,
            data: designationTypes,
            message: 'Designation Types Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getDesignationsByType API");
        throw new Error(error);
    }
};
const updateDesignation = async (req) => {
    try {
        const body = req.body;
        const departmentDetails = await DepartmentList.findOne({
            where: { name: body.departmentName }
        });
        if (!departmentDetails) {
            return {
                success: false,
                data: null,
                message: 'Department does not exist. Please enter a valid Department Name',
            }
        };

        const designationDetails = await DesignationList.update({
            name: body.designationName,
            displayName: body.designationDisplayName,
            departmentId: departmentDetails.id
        }, {
            where: { id: body.designationId }, returning: true
        },);
        return {
            success: true,
            data: designationDetails,
            message: 'Designation Updated Successfully'
        };
    } catch (error) {
        console.log(error, "Error in updateDesignation API");
        throw new Error(error);
    }
};
const updateDepartment = async (req) => {
    try {
        const body = req.body;
        const departmentDetails = await DepartmentList.update({
            name: body.departmentName,
            displayName: body.departmentDisplayName
        }, {
            where: { id: body.departmentId }, returning: true
        },);
        return {
            success: true,
            data: departmentDetails,
            message: 'Department Updated Successfully'
        };
    } catch (error) {
        console.log(error, "Error in updateDepartment API");
        throw new Error(error);
    }
};
const deleteDepartmentById = async (req) => {
    try {
        const body = req.body;
        const departmentDetail = await DepartmentList.findOne({
            where: { id: body.departmentId }
        });
        if (!departmentDetail) {
            return {
                success: false,
                data: null,
                message: 'Department does not exist. Please enter a valid DepartmentId'
            }
        }

        const designationDetail = await DesignationList.findOne({
            where: { departmentId: departmentDetail.id }
        });


        if (designationDetail) {
            const userDetail = await User.findOne({
                where: { designationId: designationDetail.id }
            });
            if (userDetail) {
                return {
                    success: false,
                    data: null,
                    message: 'Department is assigned to some users. Please reassign the Department to delete it'
                }
            }
            await DesignationList.destroy({
                where: { departmentId: departmentDetail.id }
            });
        }
        const deletedDepartment = await DepartmentList.destroy({
            where: { id: body.departmentId }
        });
        return {
            success: true,
            data: deletedDepartment,
            message: 'Department Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteDepartmentById API");
        throw new Error(error);
    }
};
const deleteDesignationById = async (req) => {
    try {
        const body = req.body;
        const userDetail = await User.findOne({
            where: { designationId: body.designationId }
        });
        if (userDetail) {
            return {
                success: false,
                data: null,
                message: 'Designation is assigned to some users. Please reassign the Designation to delete it'
            }
        }
        const deletedDesignation = await DesignationList.destroy({
            where: { id: body.designationId }
        });
        return {
            success: true,
            data: deletedDesignation,
            message: 'Designation Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteDesignationById API");
        throw new Error(error);
    }
};
const addLeadStatus = async (req) => {
    try {
        const body = req.body;
        const statusDetail = await Status.findOne({ where: { name: body.name, types: "lead" } });
        if (statusDetail) {
            return {
                success: false,
                data: null,
                message: 'Status already exists. Please enter a new Status Name'
            };
        }
        const createdStatus = await Status.create({
            name: body.name,
            displayName: body.displayName,
            types: "lead"
        });
        return { data: createdStatus, success: true };
    } catch (error) {
        throw new Error(error);
    }
};
const getAllLeadStatuses = async (req) => {
    try {
        const pageNo = req.body.pageNo ? req.body.pageNo : 1;
        const size = req.body.pageSize ? req.body.pageSize : 10;
        const statusTypes = await Status.findAndCountAll({
            where: { types: "lead" },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true
        });
        return {
            success: true,
            data: statusTypes,
            message: 'All Status Types Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllLeadStatuses API");
        throw new Error(error);
    }
};
const updateLeadStatus = async (req) => {
    try {
        const body = req.body;
        const statusDetail = await Status.update({
            name: body.name,
            displayName: body.displayName
        }, {
            where: { id: body.id }, returning: true
        },);
        return {
            success: true,
            data: statusDetail,
            message: 'Status Updated Successfully'
        };
    } catch (error) {
        console.log(error, "Error in updateLeadStatus API");
        throw new Error(error);
    }
}
const deleteLeadStatus = async (req) => {
    try {
        const body = req.body;
        const assignedLeads = await Lead.findOne({
            where: { leadStatusId: body.id }
        });
        if (assignedLeads) {
            return {
                success: false,
                data: null,
                message: 'Status is assigned to some leads. Please reassign the Status to delete this Status'
            }
        }
        const statusDetail = await Status.destroy({
            where: { id: body.id }
        });
        return {
            success: true,
            data: statusDetail,
            message: 'Status Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteLeadStatus API");
        throw new Error(error);
    }
};
const addLeadSource = async (req) => {
    try {
        const body = req.body;
        const sourceDetail = await MasterData.findOne({ where: { name: body.name, types: "leadSource" } });
        if (sourceDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead Source already exists. Please enter a new Lead Source Name'
            };
        }
        const createdSource = await MasterData.create({
            name: body.name,
            displayName: body.displayName,
            types: "leadSource"
        });
        return { data: createdSource, success: true };
    } catch (error) {
        throw new Error(error);
    }
};
const getAllLeadSources = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        const leadSourceData = await MasterData.findAndCountAll({
            where: { types: "leadSource" },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'ASC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true
        });
        return {
            success: true,
            data: leadSourceData,
            message: 'Status Types Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllLeadSources API");
        throw new Error(error);
    }
};
const updateLeadSource = async (req) => {
    try {
        const body = req.body;
        const updatedLeadSource = await MasterData.update({
            name: body.name,
            displayName: body.displayName
        }, {
            where: { id: body.id }, returning: true
        },);
        return {
            success: true,
            data: updatedLeadSource,
            message: 'Status Updated Successfully',
        };
    } catch (error) {
        console.log(error, "Error in updateLeadSource API");
        throw new Error(error);
    }
};
const deleteLeadSource = async (req) => {
    try {
        const body = req.body;
        const assignedLead = await Lead.findOne({
            where: { leadSourceId: body.id }
        });
        if (assignedLead) {
            return {
                success: false,
                data: null,
                message: 'Lead Source is assigned to some leads. Please reassign the Lead Source on them, to delete this Lead Source'
            }
        }
        const deletedSource = await MasterData.destroy({
            where: { id: body.id }
        });

        return {
            success: true,
            data: deletedSource,
            message: 'Status Deleted Successfully',
        };
    } catch (error) {
        console.log(error, "Error in deleteLeadSource API");
        throw new Error(error);
    }
};
const createLead = async (req) => {
    try {
        let leadTaskCategoryDetail, leadTaskSubCategoryDetail, leadSourceDetail, companyTypeDetail, companySizeDetail, scheduledTypeDetail, leadDurationDetail;
        const body = req.body;
        if (body.personalEmail) {
            body.personalEmail = body.personalEmail.toLowerCase();
        };
        if (body.companyEmail) {
            body.companyEmail = body.companyEmail.toLowerCase();
        };
        if (body.leadSource) {
            leadSourceDetail = await MasterData.findOne({
                where: { name: body.leadSource }
            });
        }
        if (body.leadTaskCategory) {
            leadTaskCategoryDetail = await LeadTaskCategory.findOne({
                where: { name: body.leadTaskCategory }
            });
        }
        if (body.leadTaskSubCategory) {
            leadTaskSubCategoryDetail = await LeadTaskSubCategory.findOne({
                where: { name: body.leadTaskSubCategory }
            });
        }
        const leadStatusDetail = await Status.findOne({
            where: { name: defaultStatus.scheduled }
        });
        const userDetail = await User.findOne({
            where: { id: req.decoded.userId },
            include: [{
                model: Role,
                required: false,
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }]
        });
        if (userDetail.Role.key == defaultRoles.user) {
            body.assignedToId = req.decoded.userId;
        };

        if (body.companyType) {
            companyTypeDetail = await CompanyCategory.findOne({
                where: { name: body.companyType }
            });
        }
        if (body.companySize) {
            companySizeDetail = await MasterData.findOne({
                where: { name: body.companySize, types: "companySize" }
            });
        }
        if (body.scheduledType) {
            scheduledTypeDetail = await MasterData.findOne({
                where: { name: body.scheduledType, types: "scheduledType" }
            });
        }
        if (body.scheduleDate) {
            body.scheduleDate = body.scheduleDate;
        } else {
            body.scheduleDate = dateInYyyyMmDd();
        }
        if (body.leadDuration) {
            leadDurationDetail = await MasterData.findOne({
                where: { name: body.leadDuration, types: "leadDuration" }
            });
        }

        const newLead = await Lead.create({
            name: body.name,
            personalMobile: body.personalMobile,
            companyMobile: body.companyMobile,
            personalEmail: body.personalEmail,
            companyEmail: body.companyEmail,
            companyName: body.companyName,
            companySize: companySizeDetail?.id,
            companyTypeId: companyTypeDetail?.id,
            personalAddress: body.personalAddress,
            companyAddress: body.companyAddress,
            postalCode: body.postalCode,
            city: body.city,
            state: body.state,
            country: body.country,
            website: body.website,
            facebook: body.facebook,
            linkedIn: body.linkedIn,
            twitter: body.twitter,
            budget: body.budget,
            leadDurationId: leadDurationDetail?.id,
            leadSourceId: leadSourceDetail?.id,
            leadTaskCategoryId: leadTaskCategoryDetail?.id,
            leadTaskSubCategoryId: leadTaskSubCategoryDetail?.id,
            leadStatusId: leadStatusDetail.id,
            assignedToId: body.assignedToId,
            scheduleDate: body.scheduleDate,
            scheduledTypeId: scheduledTypeDetail?.id,
            description: body.description,
            isTouched: false,
            isDeleted: false,
            deletedByUserName: null
        });
        return {
            success: true,
            data: newLead,
            message: 'Lead Created Successfully'
        };
    } catch (error) {
        console.log(error, "Error in createLead API");
        throw new Error(error);
    }

};
const getLeadDetail = async (req) => {
    try {
        const leadDetail = await Lead.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: MasterData,
                    required: false,
                    as: 'LeadSource',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadTaskCategory,
                    required: false,
                    as: 'LeadTaskCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: Status,
                    required: false,
                    as: 'LeadStatus',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: User,
                    required: false,
                    as: 'AssignedTo',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: CompanyCategory,
                    required: false,
                    as: 'CompanyCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadTaskSubCategory,
                    required: false,
                    as: 'LeadTaskSubCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'CompanySize',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'ScheduledType',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'LeadDuration',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }
            ]
        });
        if (!leadDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead does not exist. Please enter a valid LeadId'
            };
        }
        return {
            success: true,
            data: leadDetail,
            message: 'Lead Fetched Successfully'
        };
    }
    catch (error) {
        console.log(error, "Error in getLeadDetail API");
        throw new Error(error);
    }
};
const getAllLeads = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        let where = {};
        let whoLoggedIn = "admin";

        if (req.body.search) {
            where[Sequelize.Op.and] = [
                Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('Lead.name')),
                    {
                        [Sequelize.Op.like]: `%${req.body.search.toLowerCase()}%`,
                    }
                )
            ]
        }
        if (body.leadTaskCategoryId) {
            where['leadTaskCategoryId'] = body.leadTaskCategoryId;
        }
        if (body.assignedToUserId) {
            where['assignedToId'] = body.assignedToUserId;
        } else {
            const userDetail = await User.findOne({
                where: { id: req.decoded.userId },
                include: [{
                    model: Role,
                    required: true,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }]
            });
            if (userDetail.Role.key == defaultRoles.user) {
                whoLoggedIn = "user";
                where['assignedToId'] = req.decoded.userId;
            }
        }
        if (body.filter === 'day') {
            where['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('day').toDate(),
                [Sequelize.Op.lte]: moment().endOf('day').toDate(),
            };
        } else if (body.filter === 'week') {
            where['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('week').toDate(),
                [Sequelize.Op.lte]: moment().endOf('week').toDate(),
            };
        } else if (body.filter == 'month') {
            where['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('month').toDate(),
                [Sequelize.Op.lte]: moment().endOf('month').toDate(),
            };
        } else if (body.filter == "new") {
            // for new leads, only want those which are not touched(not rescheudled or closed(lead status = contacted))
            where['isTouched'] = false;
        } else if (body.filter == 'old') {
            // leads which are scheduled and touched.
            const leadStatusDetail = await Status.findOne({
                where: { name: defaultStatus.scheduled }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
            where['isTouched'] = true;
        } else if (body.startDate && body.endDate) {
            where['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
                [Sequelize.Op.lte]: convertToIST(body.endDate),
            };
        } else if (body.startDate) {
            where['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
            };
        } else {
            where['createdAt'] = {
                [Sequelize.Op.lte]: moment().endOf('datetime-local').toDate(),
            };
        }
        if (body.leadStatus == defaultStatus.contacted) {
            const leadStatusDetail = await Status.findOne({
                where: { name: body.leadStatus }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
        } else if (body.leadStatus == defaultStatus.scheduled) {
            // only assigned and scheduled leads show up in scheduled leads list in dashboard
            // only today's leads will show up
            const leadStatusDetail = await Status.findOne({
                where: { name: body.leadStatus }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
            if (!body.assignedToUserId) {
                if (whoLoggedIn == "admin") {
                    // if admin is loggedin then all leads will show up but we want only assigned leads
                    where['assignedToId'] = { [Sequelize.Op.not]: null }
                }
            }
            where['scheduleDate'] = dateInYyyyMmDd();
        } else if (body.leadStatus == "overdue") {
            // not touched leads which are scheduled for past dates, missed, scheduled leads
            const leadStatusDetail = await Status.findOne({
                where: { name: defaultStatus.scheduled }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
            where['scheduleDate'] = {
                [Sequelize.Op.lt]: dateInYyyyMmDd()
            };
        }
        if (body.assigned) {
            where['assignedToId'] = { [Sequelize.Op.not]: null }
        } else if (body.unassigned) {
            where['assignedToId'] = null
        }
        if (body.scheduleDate) {
            where['scheduleDate'] = body.scheduleDate;
        }
        if (body.isDeleted) {
            where['isDeleted'] = body.isDeleted;
        } else {
            where['isDeleted'] = false;
        }
        const leads = await Lead.findAndCountAll({
            where: where,
            include: [
                {
                    model: MasterData,
                    required: false,
                    as: 'LeadSource',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadTaskCategory,
                    required: false,
                    as: 'LeadTaskCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: Status,
                    required: false,
                    as: 'LeadStatus',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: User,
                    required: false,
                    as: 'AssignedTo',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: CompanyCategory,
                    required: false,
                    as: 'CompanyCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadTaskSubCategory,
                    required: false,
                    as: 'LeadTaskSubCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'CompanySize',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'ScheduledType',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'LeadDuration',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadActionLog,
                    required: false,
                    as: 'LeadActionLog',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }
            ],
            // attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        return {
            success: true,
            data: leads,
            message: 'Leads Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllLeads API");
        throw new Error(error);
    }
};
const updateLead = async (req) => {
    const t = await sequelize.transaction();
    try {
        // if (true){
        //     await LeadActivityLog.sequelize.query(`ALTER TABLE "LeadActivityLogs" ADD "whichColumnChange" VARCHAR(255)`);
        //     return { success: true, data: null, message: 'Column added successfully'};
        // }
        const body = req.body;
        let obj = {};
        let leadActivityLogArray = [];
        const fixedActiObj = {
            leadId: body.id,
            doneByUserId: req.decoded.userId,
            doneByUserName: req.decoded.name,
            isDeleted: false
        }
        const lead = await Lead.findOne({
            where: { id: body.id },
            include: [
                {
                    model: Status,
                    required: false,
                    as: 'LeadStatus'
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'CompanySize'
                },
                {
                    model: CompanyCategory,
                    required: false,
                    as: 'CompanyCategory'
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'LeadDuration'
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'LeadSource'
                },
                {
                    model: LeadTaskCategory,
                    required: false,
                    as: 'LeadTaskCategory'
                },
                {
                    model: LeadTaskSubCategory,
                    required: false,
                    as: 'LeadTaskSubCategory'
                },
                {
                    model: User,
                    required: false,
                    as: 'AssignedTo'
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'ScheduledType'
                }
            ]
        });
        if (!lead) return { success: false, data: null, message: 'Lead does not exist. Please enter a valid Lead' };
        let leadSourceDetail, leadTaskCategoryDetail, leadTaskSubCategoryDetail, leadStatusDetail, userDetail, companyTypeDetail, companySizeDetail, scheduledTypeDetail, leadDurationDetail;
        if (body.personalEmail) {
            body.personalEmail = body.personalEmail.toLowerCase();
        }
        if (body.companyEmail) {
            body.companyEmail = body.companyEmail.toLowerCase();
        }
        if (body.leadSource) {
            leadSourceDetail = await MasterData.findOne({
                where: { name: body.leadSource }
            });
        }
        if (body.leadTaskCategory) {
            leadTaskCategoryDetail = await LeadTaskCategory.findOne({
                where: { name: body.leadTaskCategory }
            });
        }
        if (body.leadTaskSubCategory) {
            leadTaskSubCategoryDetail = await LeadTaskSubCategory.findOne({
                where: { name: body.leadTaskSubCategory }
            });
        }
        if (body.assignedToId) {
            userDetail = await User.findOne({
                where: { id: body.assignedToId }
            });
        }
        if (body.companyType) {
            companyTypeDetail = await CompanyCategory.findOne({
                where: { name: body.companyType }
            });
        }
        if (body.companySize) {
            companySizeDetail = await MasterData.findOne({
                where: { name: body.companySize, types: "companySize" }
            });
        }
        if (body.scheduledType) {
            scheduledTypeDetail = await MasterData.findOne({
                where: { name: body.scheduledType, types: "scheduledType" }
            });
        }
        if (body.leadDuration) {
            leadDurationDetail = await MasterData.findOne({
                where: { name: body.leadDuration, types: "leadDuration" }
            });
        }
        obj = {
            name: body.name,
            personalMobile: body.personalMobile,
            companyMobile: body.companyMobile,
            personalEmail: body.personalEmail,
            companyEmail: body.companyEmail,
            companyName: body.companyName,
            companySize: companySizeDetail?.id,
            companyTypeId: companyTypeDetail?.id,
            personalAddress: body.personalAddress,
            companyAddress: body.companyAddress,
            postalCode: body.postalCode,
            city: body.city,
            state: body.state,
            country: body.country,
            website: body.website,
            facebook: body.facebook,
            linkedIn: body.linkedIn,
            twitter: body.twitter,
            budget: body.budget,
            leadDurationId: leadDurationDetail?.id,
            leadSourceId: leadSourceDetail?.id,
            leadTaskCategoryId: leadTaskCategoryDetail?.id,
            leadTaskSubCategoryId: leadTaskSubCategoryDetail?.id,
            leadStatusId: leadStatusDetail?.id,
            assignedToId: userDetail?.id,
            scheduleDate: body.scheduleDate,
            scheduledTypeId: scheduledTypeDetail?.id,
            description: body.description
        }

        if (body.leadStatus || body.scheduleDate || body.scheduledType == "closelead") {
            if (body.leadStatus == defaultStatus.contacted || body.leadStatus == defaultStatus.closed/*contacted = closed)*/ || body.scheduledType == "closelead") {
                leadStatusDetail = await Status.findOne({
                    where: { name: defaultStatus.contacted }
                });
                obj['isTouched'] = true;
                obj['scheduleDate'] = null;
                leadActivityLogArray.push({
                    ...fixedActiObj,
                    activityDetail: `Lead closed on ${dateInYyyyMmDd()}`,
                    whichColumnChanged: "leadStatus"
                });
            } else if (body.scheduleDate /*|| body.leadStatus == defaultStatus.scheduled*/) {
                leadStatusDetail = await Status.findOne({
                    where: { name: defaultStatus.scheduled }
                });
                obj['isTouched'] = true;
                // for lead Activity Logs
                if (lead.scheduleDate !== body.scheduleDate) {
                    if (lead.scheduleDate == null) {
                        leadActivityLogArray.push({
                            ...fixedActiObj,
                            activityDetail: `Lead scheduled for ${body.scheduleDate}`,
                            whichColumnChanged: "leadStatus"
                        });
                    } else {
                        leadActivityLogArray.push({
                            ...fixedActiObj,
                            activityDetail: `Lead rescheduled from ${lead.scheduleDate} to ${body.scheduleDate}`,
                            whichColumnChanged: "leadStatus"
                        });
                    }
                }
            }
            if (leadStatusDetail) {
                obj['leadStatusId'] = leadStatusDetail.id;
            }
        }
        if (body.name) {
            if (lead.name !== body.name) {
                if (lead.name == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead name was set to ${body.name}`,
                        whichColumnChanged: "name"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead name changed from ${lead.name} to ${body.name}`,
                        whichColumnChanged: "name"
                    });
                }
            }
        }
        if (body.personalMobile) {
            if (lead.personalMobile !== body.personalMobile) {
                if (lead.personalMobile == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Personal Mobile Number was set to ${body.personalMobile}`,
                        whichColumnChanged: "personalMobile"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Personal Mobile Number changed from ${lead.personalMobile} to ${body.personalMobile}`,
                        whichColumnChanged: "personalMobile"
                    });
                }
            }
        }
        if (body.companyMobile) {
            if (lead.companyMobile !== body.companyMobile) {
                if (lead.companyMobile == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Mobile Number was set to ${body.companyMobile}`,
                        whichColumnChanged: "companyMobile"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Mobile Number changed from ${lead.companyMobile} to ${body.companyMobile}`,
                        whichColumnChanged: "companyMobile"
                    });
                }
            }
        }
        if (body.personalEmail) {
            if (lead.personalEmail !== body.personalEmail) {
                if (lead.personalEmail == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Personal Email was set to ${body.personalEmail}`,
                        whichColumnChanged: "personalEmail"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Personal Email changed from ${lead.personalEmail} to ${body.personalEmail}`,
                        whichColumnChanged: "personalEmail"
                    });
                }
            }
        }
        if (body.companyEmail) {
            if (lead.companyEmail !== body.companyEmail) {
                if (lead.companyEmail == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Email was set to ${body.companyEmail}`,
                        whichColumnChanged: "companyEmail"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Email changed from ${lead.companyEmail} to ${body.companyEmail}`,
                        whichColumnChanged: "companyEmail"
                    });
                }
            }
        }
        if (body.companyName) {
            if (lead.companyName !== body.companyName) {
                if (lead.companyName == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Name was set to ${body.companyName}`,
                        whichColumnChanged: "companyName"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Name changed from ${lead.companyName} to ${body.companyName}`,
                        whichColumnChanged: "companyName"
                    });
                }
            }
        }
        if (body.companySize) {
            if (lead.companySize !== companySizeDetail?.id) {
                if (lead.companySize == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Size was set to ${companySizeDetail?.name}`,
                        whichColumnChanged: "companySize"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Size changed from ${lead.CompanySize.name} to ${companySizeDetail?.name}`,
                        whichColumnChanged: "companySize"
                    });
                }
            }
        }
        if (body.companyType) {
            if (lead.companyTypeId !== companyTypeDetail?.id) {
                if (lead.companyTypeId == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Type was set to ${companyTypeDetail?.name}`,
                        whichColumnChanged: "companyType"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Type changed from ${lead.CompanyCategory.name} to ${companyTypeDetail?.name}`,
                        whichColumnChanged: "companyType"
                    });
                }
            }
        }
        if (body.personalAddress) {
            if (lead.personalAddress !== body.personalAddress) {
                if (lead.personalAddress == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Personal Address was set to ${body.personalAddress}`,
                        whichColumnChanged: "personalAddress"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Personal Address changed from ${lead.personalAddress} to ${body.personalAddress}`,
                        whichColumnChanged: "personalAddress"
                    });
                }
            }
        }
        if (body.companyAddress) {
            if (lead.companyAddress !== body.companyAddress) {
                if (lead.companyAddress == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Address was set to ${body.companyAddress}`,
                        whichColumnChanged: "companyAddress"
                    });
                } else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Company Address changed from ${lead.companyAddress} to ${body.companyAddress}`,
                        whichColumnChanged: "companyAddress"
                    });
                }
            }
        }
        if (body.postalCode) {
            if (lead.postalCode !== body.postalCode) {
                if (lead.postalCode == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Postal Code was set to ${body.postalCode}`,
                        whichColumnChanged: "postalCode"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Postal Code changed from ${lead.postalCode} to ${body.postalCode}`,
                        whichColumnChanged: "postalCode"
                    });
                }
            }
        }
        if (body.city) {
            if (lead.city !== body.city) {
                if (lead.city == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `City was set to ${body.city}`,
                        whichColumnChanged: "city"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `City was changed from ${lead.city} to ${body.city}`,
                        whichColumnChanged: "city"
                    });
                }
            }
        }
        if (body.state) {
            if (lead.state !== body.state) {
                if (lead.state == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `State was set to ${body.state}`,
                        whichColumnChanged: "state"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `State was changed from ${lead.state} to ${body.state}`,
                        whichColumnChanged: "state"
                    });
                }
            }
        }
        if (body.country) {
            if (lead.country !== body.country) {
                if (lead.country == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Country was set to ${body.country}`,
                        whichColumnChanged: "country"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Country was changed from ${lead.country} to ${body.country}`,
                        whichColumnChanged: "country"
                    });
                }
            }
        }
        if (body.website) {
            if (lead.website !== body.website) {
                if (lead.website == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Website was set to ${body.website}`,
                        whichColumnChanged: "website"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Website was changed from ${lead.website} to ${body.website}`,
                        whichColumnChanged: "website"
                    });
                }
            }
        }
        if (body.facebook) {
            if (lead.facebook !== body.facebook) {
                if (lead.facebook == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Facebook was set to ${body.facebook}`,
                        whichColumnChanged: "facebook"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Facebook was changed from ${lead.facebook} to ${body.facebook}`,
                        whichColumnChanged: "facebook"
                    });
                }
            }
        }
        if (body.linkedIn) {
            if (lead.linkedIn !== body.linkedIn) {
                if (lead.linkedIn == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `LinkedIn was set to ${body.linkedIn}`,
                        whichColumnChanged: "linkedIn"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `LinkedIn changed from ${lead.linkedIn} to ${body.linkedIn}`,
                        whichColumnChanged: "linkedIn"
                    });
                }
            }
        }
        if (body.twitter) {
            if (lead.twitter !== body.twitter) {
                if (lead.twitter == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Twitter was set to ${body.twitter}`,
                        whichColumnChanged: "twitter"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Twitter changed from ${lead.twitter} to ${body.twitter}`,
                        whichColumnChanged: "twitter"
                    });
                }
            }
        }
        if (body.budget) {
            if (lead.budget !== body.budget) {
                if (lead.budget == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Budget was set to ${body.budget}`,
                        whichColumnChanged: "budget"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Budget changed from ${lead.budget} to ${body.budget}`,
                        whichColumnChanged: "budget"
                    });
                }
            }
        }
        if (body.leadDuration) {
            if (lead.leadDurationId !== leadDurationDetail?.id) {
                if (lead.leadDurationId == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Duration was set to ${leadDurationDetail?.displayName}`,
                        whichColumnChanged: "leadDuration"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Duration changed from ${lead.LeadDuration?.displayName} to ${leadDurationDetail?.displayName}`,
                        whichColumnChanged: "leadDuration"
                    });
                }
            }
        }
        if (body.leadSource) {
            if (lead.leadSourceId !== leadSourceDetail?.id) {
                if (lead.leadSourceId == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Source was set to ${leadSourceDetail?.displayName}`,
                        whichColumnChanged: "leadSource"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Source changed from ${lead.LeadSource?.displayName} to ${leadSourceDetail?.displayName}`,
                        whichColumnChanged: "leadSource"
                    });
                }
            }
        }
        if (body.leadTaskCategory) {
            if (lead.leadTaskCategoryId !== leadTaskCategoryDetail?.id) {
                if (lead.leadTaskCategoryId == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Task Category was set to ${leadTaskCategoryDetail?.displayName}`,
                        whichColumnChanged: "leadTaskCategory"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Task Category changed from ${lead.LeadTaskCategory?.displayName} to ${leadTaskCategoryDetail?.displayName}`,
                        whichColumnChanged: "leadTaskCategory"
                    });
                }
            }
        }
        if (body.leadTaskSubCategory) {
            if (lead.leadTaskSubCategoryId !== leadTaskSubCategoryDetail?.id) {
                if (lead.leadTaskSubCategoryId == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Task Sub Category was set to ${leadTaskSubCategoryDetail?.displayName}`,
                        whichColumnChanged: "leadTaskSubCategory"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead Task Sub Category changed from ${lead.LeadTaskSubCategory?.displayName} to ${leadTaskSubCategoryDetail?.displayName}`,
                        whichColumnChanged: "leadTaskSubCategory"
                    });
                }
            }
        }
        // if (body.leadStatus) {
        //     if (lead.leadStatusId !== leadStatusDetail?.id) {
        //         if (lead.leadStatusId == null) {
        //             leadActivityLogArray.push({
        //                 ...fixedActiObj,
        //                 activityDetail: `Lead Status was set to ${leadStatusDetail?.name}`,
        //                 whichColumnChanged: "leadStatus"
        //             });
        //         }
        //         else {
        //             leadActivityLogArray.push({
        //                 ...fixedActiObj,
        //                 activityDetail: `Lead Status changed from ${lead.LeadStatus?.name} to ${leadStatusDetail?.name}`,
        //                 whichColumnChanged: "leadStatus"
        //             });
        //         }
        //     }
        // }
        if (body.assignedToId) {
            if (lead.assignedToId !== userDetail?.id) {
                if (lead.assignedToId == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead was assigned to ${userDetail?.name}`,
                        whichColumnChanged: "assignedTo"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead was assigned from ${lead.AssignedTo?.name} to ${userDetail?.name}`,
                        whichColumnChanged: "assignedTo"
                    });
                }
            }
        }
        // if (body.scheduleDate) {
        //     if (lead.scheduleDate !== body.scheduleDate) {
        //         if (lead.scheduleDate == null) {
        //             leadActivityLogArray.push({
        //                 ...fixedActiObj,
        //                 activityDetail: `Lead is scheduled for ${body.scheduleDate}`,
        //                 whichColumnChanged: "scheduleDate"
        //             });
        //         }
        //         else {
        //             leadActivityLogArray.push({
        //                 ...fixedActiObj,
        //                 activityDetail: `Scheduled Date was changed from ${lead.scheduleDate} to ${body.scheduleDate}`,
        //                 whichColumnChanged: "scheduleDate"
        //             });
        //         }
        //     }
        // }
        if (body.scheduledType) {
            if (lead.scheduledTypeId !== scheduledTypeDetail?.id) {
                if (lead.scheduledTypeId == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead was scheduled for ${scheduledTypeDetail?.displayName}`,
                        whichColumnChanged: "scheduledType"
                    });

                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Lead was scheduled for ${scheduledTypeDetail?.displayName} from ${lead.ScheduledType?.displayName}.`,
                        whichColumnChanged: "scheduledType"
                    });
                }
            }
        }
        if (body.description) {
            if (lead.description !== body.description) {
                if (lead.description == null) {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Description was set to ${body.description}`,
                        whichColumnChanged: "description"
                    });
                }
                else {
                    leadActivityLogArray.push({
                        ...fixedActiObj,
                        activityDetail: `Description changed from ${lead.description} to ${body.description}`,
                        whichColumnChanged: "description"
                    });
                }
            }
        }

        const updatedLead = await Lead.update(obj, {
            where: { id: body.id },
            returning: true,
            transaction: t
        });
        if (leadActivityLogArray?.length > 0) {
            if (Array.isArray(body.id) && body.id.length > 1) {
                await Promise.all(
                    body.id.map(async (leadId) => {
                        leadActivityLogArray.map((item) => {
                            item.leadId = leadId;
                        })
                        await LeadActivityLog.bulkCreate(leadActivityLogArray, { fields: ['leadId', 'doneByUserId', 'doneByUserName', 'activityDetail', 'whichColumnChanged', 'isDeleted'] }, { transaction: t })
                    }))
            } else {
                await LeadActivityLog.bulkCreate(leadActivityLogArray, { fields: ['leadId', 'doneByUserId', 'doneByUserName', 'activityDetail', 'whichColumnChanged', 'isDeleted'] }, { transaction: t })
            }
        }
        // const arrrr = []
        // leadActionLogArray.map((item) => {
        //     arrrr.push(item.activityDetail)
        // })
        await t.commit();
        return {
            // arrrr,
            success: true,
            data: updatedLead,
            message: 'Lead Updated Successfully'
        };
    } catch (error) {
        await t.rollback();
        console.log(error, "Error in updateLead API");
        throw new Error(error);
    }
};
const deleteLead = async (req) => {
    const t = await sequelize.transaction();
    try {
        const body = req.body;
        let log;
        const leadDetail = await Lead.findOne({
            where: { id: body.id }
        });
        if (!leadDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead does not exist. Please enter a valid Lead'
            };
        }
        const userDetail = await User.findOne({
            where: { id: req.decoded.userId },
            include: [{
                model: Role,
                required: true
            }]
        });
        if (userDetail?.Role.key == defaultRoles.admin) {
            await LeadActionLog.destroy({
                where: { leadId: body.id },
                transaction: t
            });
            await LeadActivityLog.destroy({
                where: { leadId: body.id },
                transaction: t
            });
            await Lead.destroy({
                where: { id: body.id },
                transaction: t
            });
        } else {
            await LeadActionLog.update({
                isDeleted: true
            }, {
                where: { leadId: body.id },
                transaction: t
            });

            await LeadActivityLog.update({
                isDeleted: true
            }, {
                where: { leadId: body.id },
                transaction: t
            });
            await Lead.update({
                isDeleted: true,
                deletedByUserName: userDetail.name,
            }, {
                where: { id: body.id },
                transaction: t
            });
            log = await LeadActivityLog.create({
                leadId: body.id,
                doneByUserId: req.decoded.userId,
                doneByUserName: req.decoded.name,
                activityDetail: `Lead Deleted on ${dateInYyyyMmDd()}`,
                isDeleted: false
            }, { transaction: t });
        }

        await t.commit();
        return {
            success: true,
            data: log,
            message: 'Lead Deleted Successfully'
        };
    }
    catch (error) {
        console.log(error, "Error in deleteLead API");
        await t.rollback();
        throw new Error(error);
    }
};
const getCompanySizes = async (req) => {
    try {
        const companySize = await MasterData.findAll({
            where: { types: "companySize" },
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });
        return {
            success: true,
            data: companySize,
            message: 'Company Size Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getCompanySize API");
        throw new Error(error);
    }
};
const createCompanyCategory = async (req) => {
    try {
        const body = req.body;
        const companyCategoryDetail = await CompanyCategory.findOne({
            where: { name: body.name }
        });
        if (companyCategoryDetail) {
            return {
                success: false,
                data: null,
                message: 'Company Category already exists. Please enter a new Company Category Name',
            };
        }
        const newCompanyCategory = await CompanyCategory.create({
            name: body.name,
            displayName: body.displayName
        });
        return {
            success: true,
            data: newCompanyCategory,
            message: 'Company Category Created Successfully',
        };
    }
    catch (error) {
        console.log(error, "Error in createCompanyCategory API");
        throw new Error(error);
    }
};
const getAllCompanyCategories = async (req) => {
    try {
        const companyCategories = await CompanyCategory.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']]
        });
        return {
            success: true,
            data: companyCategories,
            message: 'Company Categories Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllCompanyCategories API");
        throw new Error(error);
    }
};
const updateCompanyCategory = async (req) => {
    try {
        const body = req.body;
        const companyCategoryDetail = await CompanyCategory.update({
            name: body.name,
            displayName: body.displayName
        }, {
            where: { id: body.id }, returning: true
        },);
        return {
            success: true,
            data: companyCategoryDetail,
            message: 'Company Category Updated Successfully'
        };
    } catch (error) {
        console.log(error, "Error in updateCompanyCategory API");
        throw new Error(error);
    }
};
const deleteCompanyCategory = async (req) => {
    try {
        const body = req.body;
        const companyCategoryDetail = await CompanyCategory.findOne({
            where: { id: body.id }
        });
        if (!companyCategoryDetail) {
            return {
                success: false,
                data: null,
                message: 'Company Category does not exist. Please enter a valid Company Category'
            };
        }
        const deletedCompanyCategory = await CompanyCategory.destroy({
            where: { id: body.id }
        });
        return {
            success: true,
            data: deletedCompanyCategory,
            message: 'Company Category Deleted Successfully'
        };
    }
    catch (error) {
        console.log(error, "Error in deleteCompanyCategory API");
        throw new Error(error);
    }
};
const createDropDown = async (req) => {
    try {
        const body = req.body;
        const actionTypeDetail = await MasterData.findOne({
            where: { types: body.type, name: body.name }
        });
        if (actionTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'This Type already exists. Please enter a new Type Name'
            };
        }
        const newActionType = await MasterData.create({
            types: body.type,
            name: body.name,
            displayName: body.displayName
        });
        return {
            success: true,
            data: newActionType,
            message: 'Action Type Created Successfully',
        };
    }
    catch (error) {
        console.log(error, "Error in createActionType API");
        throw new Error(error);
    }
};
const getDropDownByType = async (req) => {
    try {
        const body = req.body;
        const dropDown = await MasterData.findAll({
            where: { types: body.type },
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        })
        return {
            success: true,
            data: dropDown,
            message: `${body.type}s Fetched Successfully`
        }

    }
    catch (error) {
        console.log(error, "Error in getDropDownByType API");
        throw new Error(error);
    }
};
const updateDropDown = async (req) => {
    try {
        const body = req.body;
        const dropDownDetail = await MasterData.update({
            name: body.name,
            displayName: body.displayName
        }, {
            where: { id: body.id }, returning: true
        },);
        return {
            success: true,
            data: dropDownDetail,
            message: 'Action Type Updated Successfully'
        };
    } catch {
        console.log(error, "Error in updateDropDown API");
        throw new Error(error);

    }
};
const deleteDropDown = async (req) => {
    try {
        const body = req.body;
        const dropDownDetail = await MasterData.findOne({
            where: { id: body.id }
        });
        const leadActionLogDetail = await LeadActionLog.findOne({
            where: { actionTypeId: dropDownDetail.id }
        });
        const companySizeDetail = await Lead.findOne({
            where: { companySize: dropDownDetail.id }
        });
        const leadDurationDetail = await Lead.findOne({
            where: { leadDurationId: dropDownDetail.id }
        });
        const leadSourceDetail = await Lead.findOne({
            where: { leadSourceId: dropDownDetail.id }
        });
        const scheduledTypeDetail = await Lead.findOne({
            where: { scheduledTypeId: dropDownDetail.id }
        });
        if (leadActionLogDetail) {
            return {
                success: false,
                data: null,
                message: 'This Type cannot be deleted as it is associated with some Lead Action Logs'
            };
        } else if (leadActionLogDetail || leadDurationDetail || companySizeDetail || leadSourceDetail || scheduledTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'This Type cannot be deleted as it is associated with some Leads'
            };
        }
        if (!dropDownDetail) {
            return {
                success: false,
                data: null,
                message: 'No type is associated with this id. Please enter a valid id'
            };
        }
        const deletedDropDown = await MasterData.destroy({
            where: { id: body.id }
        });
        return {
            success: true,
            data: deletedDropDown,
            message: 'Type Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteDropDown API");
        throw new Error(error);
    }
};
const createLeadTaskCategory = async (req) => {
    try {
        const body = req.body;
        const leadTaskCategoryDetail = await LeadTaskCategory.findOne({
            where: { name: body.leadTaskCategoryName }
        });
        if (leadTaskCategoryDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead Task Category already exists. Please enter a different Lead Task Category Name'
            };
        } else {
            const newLeadTaskCategory = await LeadTaskCategory.create({
                name: body.leadTaskCategoryName,
                displayName: body.leadTaskCategoryDisplayName
            });
            return {
                success: true,
                data: newLeadTaskCategory,
                message: 'Lead Task Category Added Successfully'
            };
        }
    } catch (error) {
        console.log(error, "Error in createLeadTaskCategory API");
        throw new Error(error);
    }
};
const createLeadTaskSubCategory = async (req) => {
    try {
        const body = req.body;
        const leadTaskCategoryDetail = await LeadTaskCategory.findOne({
            where: { name: body.leadTaskCategoryName }
        });
        if (!leadTaskCategoryDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead Task Category does not exist. Please enter a valid Lead Task Category Name'
            };
        }
        const leadTaskSubCategoryDetail = await LeadTaskSubCategory.findOne({
            where: { name: body.leadTaskSubCategoryName, leadTaskCategoryId: leadTaskCategoryDetail.id }
        });
        if (leadTaskSubCategoryDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead Task Sub Category already exists. Please enter a different Lead Task Sub Category Name'
            };
        } else {
            const newLeadTaskSubCategory = await LeadTaskSubCategory.create({
                name: body.leadTaskSubCategoryName,
                displayName: body.leadTaskSubCategoryDisplayName,
                leadTaskCategoryId: leadTaskCategoryDetail.id
            });
            return {
                success: true,
                data: newLeadTaskSubCategory,
                message: 'Lead Task Sub Category Added Successfully'
            };
        }
    }
    catch (error) {
        console.log(error, "Error in createLeadTaskSubCategory API");
        throw new Error(error);
    }
};
const getAllLeadTaskCategory = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        const leadTaskCategoryTypes = await LeadTaskCategory.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        return {
            success: true,
            data: leadTaskCategoryTypes,
            message: 'All Lead Task Category Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllLeadTaskCategory API");
        throw new Error(error);
    }
};
const getLeadTaskSubCategoryByType = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        let where = {};
        if (body.leadTaskCategory) {
            const leadTaskCategoryDetail = await LeadTaskCategory.findOne({
                where: { name: body.leadTaskCategory }
            });
            where = { leadTaskCategoryId: leadTaskCategoryDetail.id }
        }
        const getLeadTaskSubCategoryTypes = await LeadTaskSubCategory.findAndCountAll({
            where: where,
            include: [{
                model: LeadTaskCategory,
                required: false,
                as: 'LeadTaskCategories',
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        if (!getLeadTaskSubCategoryTypes) {
            return {
                success: false,
                data: null,
                message: 'No Lead Task Sub Category Found',
            };
        }
        return {
            success: true,
            data: getLeadTaskSubCategoryTypes,
            message: 'Lead Task Sub Category Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getDesignationsByType API");
        throw new Error(error);
    }
};
const updateLeadTaskCategory = async (req) => {
    try {
        const body = req.body;
        const leadTaskCategoryDetail = await LeadTaskCategory.update({
            name: body.leadTaskCategoryName,
            displayName: body.leadTaskCategoryDisplayName
        }, {
            where: { id: body.leadTaskCategoryId }, returning: true
        },);
        return {
            success: true,
            data: leadTaskCategoryDetail,
            message: 'Lead Task Category Updated Successfully'
        };
    } catch (error) {
        console.log(error, "Error in updateLeadTaskCategory API");
        throw new Error(error);
    }
};
const updateLeadTaskSubCategory = async (req) => {
    try {
        const body = req.body;
        const leadTaskCategoryDetail = await LeadTaskCategory.findOne({
            where: { name: body.leadTaskCategoryName }
        });
        if (!leadTaskCategoryDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead Task Category does not exist. Please enter a valid Lead Task Category Name'
            };
        }
        const leadTaskSubCategoryDetail = await LeadTaskSubCategory.update({
            name: body.leadTaskSubCategoryName,
            displayName: body.leadTaskSubCategoryDisplayName,
            leadTaskCategoryId: leadTaskCategoryDetail.id
        }, {
            where: { id: body.leadTaskCategoryId }, returning: true
        },);
        return {
            success: true,
            data: leadTaskSubCategoryDetail,
            message: 'Lead Task Sub Category Updated Successfully'
        };
    } catch (error) {
        console.log(error, "Error in updateLeadTaskSubCategory API");
        throw new Error(error);
    }
};
const deleteLeadTaskCategory = async (req) => {
    try {
        const body = req.body;
        const leadTaskCategoryDetail = await LeadTaskCategory.findOne({
            where: { id: body.leadTaskCategoryId }
        });
        const leadDetail = await Lead.findOne({
            where: { leadTaskCategoryId: leadTaskCategoryDetail.id }
        });
        if (leadDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead Task Category is assigned to some leads. Please reassign the Lead Task Category to delete it'
            }
        }
        const leadTaskSubCategoryDetail = await LeadTaskSubCategory.findAll({
            where: { leadTaskCategoryId: leadTaskCategoryDetail.id }
        });
        if (leadTaskSubCategoryDetail.length > 0) {
            return {
                success: false,
                data: null,
                message: 'Lead Task Category is assigned to some Lead Task Sub Categories. Please reassign the Lead Task Category to delete it'
            }
        }
        const deletedLeadTaskCategory = await LeadTaskCategory.destroy({
            where: { id: body.leadTaskCategoryId }
        });
        return {
            success: true,
            data: deletedLeadTaskCategory,
            message: 'Lead Task Category Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteLeadTaskCategory API");
        throw new Error(error);
    }
};
const deleteLeadTaskSubCategory = async (req) => {
    try {
        const body = req.body;
        const leadDetail = await Lead.findOne({
            where: { leadTaskSubCategoryId: body.leadTaskSubCategoryId }
        });
        if (leadDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead Task Sub Category is assigned to some leads. Please reassign the Lead Task Sub Category to delete it'
            }
        }
        const deletedLeadTaskSubCategory = await LeadTaskSubCategory.destroy({
            where: { id: body.leadTaskSubCategoryId }
        });
        return {
            success: true,
            data: deletedLeadTaskSubCategory,
            message: 'Lead Task Sub Category Deleted Successful'
        };
    } catch (error) {
        console.log(error, "Error in deleteLeadTaskCategory API");
        throw new Error(error);
    }
};
const createActionType = async (req) => {
    try {
        const body = req.body;
        const actionTypeDetail = await ActionType.findOne({
            where: { name: body.name }
        });
        if (actionTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'Action Type already exists. Please enter a new Action Type Name'
            };
        }
        const newActionType = await ActionType.create({
            name: body.name,
            displayName: body.displayName
        });
        return {
            success: true,
            data: newActionType,
            message: 'Action Type Created Successfully',
        };
    }
    catch (error) {
        console.log(error, "Error in createActionType API");
        throw new Error(error);
    }
};
const getAllActionTypes = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        const actionTypes = await ActionType.findAndCountAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'ASC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        return {
            success: true,
            data: actionTypes,
            message: 'Action Types Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllActionTypes API");
        throw new Error(error);
    }
};
const updateActionType = async (req) => {
    try {
        const body = req.body;
        let actionTypeDetail = await ActionType.findOne({
            where: { id: body.actionTypeId }
        });
        if (!actionTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'Action Type Id does not exist. Please enter a valid Action Type Id'
            };
        }
        actionTypeDetail = await ActionType.update({
            name: body.actionTypeName,
            displayName: body.actionTypeDisplayName
        }, {
            where: { id: body.actionTypeId }, returning: true
        },);
        return {
            success: true,
            data: actionTypeDetail,
            message: 'Action Type Updated Successfully'
        };
    } catch {
        console.log(error, "Error in updateActionType API");
        throw new Error(error);

    }
};
const deleteActionType = async (req) => {
    try {
        const body = req.body;
        const actionTypeDetail = await ActionType.findOne({
            where: { id: body.actionTypeId }
        });
        if (!actionTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'No type is associated with this id. Please enter a valid id'
            };
        }
        const leadActionLogDetail = await LeadActionLog.findOne({
            where: { actionTypeId: actionTypeDetail.id }
        });
        if (leadActionLogDetail) {
            return {
                success: false,
                data: null,
                message: 'This Type cannot be deleted as it is associated with some Lead Action Logs. First delete the Lead Action Logs associated with this Type'
            };
        }
        const actionSubTypeDetail = await ActionSubType.findOne({
            where: { actionTypeId: actionTypeDetail.id }
        });
        if (actionSubTypeDetail) {
            const leadActionLogDetail = await LeadActionLog.findOne({
                where: { actionSubTypeId: actionSubTypeDetail.id }
            });
            if (leadActionLogDetail) {
                return {
                    success: false,
                    data: null,
                    message: 'This Type cannot be deleted as it is associated with some Lead Action Logs. First delete the Lead Action Logs associated with this Type'
                }
            }
            await ActionSubType.destroy({
                where: { actionTypeId: actionTypeDetail.id }
            });
        }

        const deletedActionType = await ActionType.destroy({
            where: { id: body.actionTypeId }
        });
        return {
            success: true,
            data: deletedActionType,
            message: 'Type Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteActionType API");
        throw new Error(error);
    }
};
const createActionSubType = async (req) => {
    try {
        const body = req.body;
        const actionTypeDetail = await ActionType.findOne({
            where: { id: body.actionTypeId }
        });
        if (!actionTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'Action Type does not exist. Please enter a valid Action Type'
            };
        }
        const actionSubTypeDetail = await ActionSubType.findOne({
            where: { name: body.name }
        });
        if (actionSubTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'Action Sub Type already exists. Please enter a new Action Sub Type Name'
            };
        }
        const newActionSubType = await ActionSubType.create({
            name: body.name,
            displayName: body.displayName,
            actionTypeId: actionTypeDetail.id
        });
        return {
            success: true,
            data: newActionSubType,
            message: 'Action Sub Type Created Successfully',
        };
    }
    catch (error) {
        console.log(error, "Error in createActionSubType API");
        throw new Error(error);
    }
};
const getActionSubTypesByType = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        let where = {};
        if (body.actionTypeId) {
            where['actionTypeId'] = body.actionTypeId;
        }
        const actionSubTypes = await ActionSubType.findAndCountAll({
            where: where,
            include: [
                {
                    model: ActionType,
                    required: false,
                    as: 'ActionType'
                }
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'ASC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true
        });
        if (!actionSubTypes) {
            return {
                success: false,
                data: null,
                message: 'No Action Sub Types Found',
            };
        }
        return {
            success: true,
            data: actionSubTypes,
            message: 'Action Sub Types Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllActionSubTypes API");
        throw new Error(error);
    }
};
const updateActionSubType = async (req) => {
    try {
        const body = req.body;
        const actionTypeDetail = await ActionType.findOne({
            where: { id: body.actionTypeId }
        });
        if (!actionTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'Action Type does not exist. Please enter a valid Action Type'
            };
        }
        const actionSubTypeDetail = await ActionSubType.update({
            name: body.actionSubTypeName,
            displayName: body.actionSubTypeDisplayName,
            actionTypeId: actionTypeDetail.id
        }, {
            where: { id: body.actionSubTypeId }, returning: true
        },);
        return {
            success: true,
            data: actionSubTypeDetail,
            message: 'Action Sub Type Updated Successfully'
        };
    } catch (error) {
        console.log(error, "Error in updateActionSubType API");
        throw new Error(error);

    }
};
const deleteActionSubType = async (req) => {
    try {
        const body = req.body;
        const actionSubTypeDetail = await ActionSubType.findOne({
            where: { id: body.actionSubTypeId }
        });
        if (!actionSubTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'No type is associated with this id. Please enter a valid id'
            };
        }
        const leadActionLogDetail = await LeadActionLog.findOne({
            where: { actionSubTypeId: actionSubTypeDetail.id }
        });
        if (leadActionLogDetail) {
            return {
                success: false,
                data: null,
                message: 'This Type cannot be deleted as it is associated with some Lead Action Logs'
            };
        }
        const deletedActionSubType = await ActionSubType.destroy({
            where: { id: body.actionSubTypeId }
        });
        return {
            success: true,
            data: deletedActionSubType,
            message: 'Type Deleted Successfully'
        };
    } catch (error) {
        console.log(error, "Error in deleteActionSubType API");
        throw new Error(error);
    }
};
const createLeadActionLog = async (req) => {
    try {
        const body = req.body;
        let leadTemperature;
        const leadDetail = await Lead.findOne({
            where: { id: body.leadId }
        });
        if (!leadDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead does not exist. Please enter a valid Lead'
            };
        }
        if (leadDetail.assignedToId == null) {
            return {
                success: false,
                data: null,
                message: 'Lead is not assigned to any user. Please assign the Lead to a user'
            };
        }
        const userDetail = await User.findOne({
            where: { id: leadDetail.assignedToId }
        });
        if (body.leadStatus) {
            leadTemperature = await MasterData.findOne({
                where: { types: "leadStatus", name: body.leadStatus }
            });
        }
        const actionTypeDetail = await ActionType.findOne({
            where: { id: body.actionTypeId }
        });
        if (!actionTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'Action Type does not exist. Please enter a valid Action Type'
            };
        }
        const actionSubTypeDetail = await ActionSubType.findOne({
            where: { id: body.actionSubTypeId }
        });
        if (!actionSubTypeDetail) {
            return {
                success: false,
                data: null,
                message: 'Action Sub Type does not exist. Please enter a valid Action Sub Type'
            };
        }
        const actionTypeSubActionTypeRelation = await ActionSubType.findOne({
            where: { id: body.actionSubTypeId, actionTypeId: body.actionTypeId }
        });
        if (!actionTypeSubActionTypeRelation) {
            return {
                success: false,
                data: null,
                message: 'Action Sub Type does not belong to the Action Type. Please enter a valid Action Sub Type'
            };
        }
        const result = await LeadActionLog.create({
            leadId: leadDetail.id,
            actionTypeId: actionTypeDetail.id,
            actionSubTypeId: actionSubTypeDetail.id,
            logDescription: body.logDescription,
            assignedEmployeeId: userDetail?.id,
            leadStatusId: leadTemperature?.id,
            isDeleted: false
        });
        return {
            success: true,
            data: result,
            message: 'Lead Log Created Successfully'
        };

    } catch (error) {
        console.log(error, "Error in createLeadActionLog API");
        throw new Error(error);
    }
};
const getAllLeadActionLogs = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;

        let where = {};
        let where2 = {};
        if (body.assignedToUserId) {
            where2['id'] = body.assignedToUserId;
        } else {
            if (req.decoded.userId) {
                const userDetail = await User.findOne({
                    where: { id: req.decoded.userId },
                    include: [{
                        model: Role,
                        required: true,
                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                    }]
                });
                if (userDetail.Role.key == defaultRoles.user) {
                    where2['id'] = req.decoded.userId;
                }
            }
        }
        if (body.leadId) {
            where['leadId'] = body.leadId;
        }
        if (body.isDeleted) {
            where['isDeleted'] = body.isDeleted;
        } else {
            where['isDeleted'] = false;
        }
        const leadActionLogs = await LeadActionLog.findAndCountAll({
            where: where,
            include: [
                {
                    model: Lead,
                    required: true,
                    as: 'LeadDetail',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    include: [{
                        model: User,
                        where: where2,
                        required: true,
                        as: 'AssignedTo',
                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                    }]
                },
                {
                    model: MasterData,
                    required: false,
                    as: 'LeadTemperatureStatus'
                },
                // {
                //     model: ActionType,   
                //     required: false,
                //     as: 'ActionType',
                //     attributes: { exclude: ['createdAt', 'updatedAt'] }
                // },
                {
                    model: ActionSubType,
                    required: false,
                    as: 'ActionSubType',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
            ],
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true
        });
        return {
            success: true,
            data: leadActionLogs,
            message: 'Lead Logs Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllLeadActionLogs API");
        throw new Error(error);
    }
};
const getLeadActivityLogs = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;

        let where = {};
        if (body.doneByUserId) {
            where['doneByUserId'] = body.doneByUserId;
        } else {
            if (req.decoded.userId) {
                const userDetail = await User.findOne({
                    where: { id: req.decoded.userId },
                    include: [{
                        model: Role,
                        required: true,
                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                    }]
                });
                if (userDetail.Role.key == defaultRoles.user) {
                    where['doneByUserId'] = req.decoded.userId;
                }
            }
        }
        if (body.leadId) {
            where['leadId'] = body.leadId;
        }
        if (body.isDeleted) {
            where['isDeleted'] = body.isDeleted;
        } else {
            where['isDeleted'] = false;
        }
        const leadActivityLogs = await LeadActivityLog.findAndCountAll({
            where: where,
            include: [
                {
                    model: Lead,
                    required: true,
                    as: 'LeadInfo',
                }
            ],
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true
        });
        return {
            success: true,
            data: leadActivityLogs,
            message: 'Lead Activity Logs Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getLeadActivityLogs API");
        throw new Error(error);
    }
};
//for reports
const getAllLeadCount = async (req) => {
    try {
        const body = req.body;
        // let whoLoggedIn = "admin";
        let whereCondition = {};
        if (body.filter == "today") {
            whereCondition['updatedAt'] = {
                [Sequelize.Op.gte]: moment().startOf('day').toDate(),
                [Sequelize.Op.lte]: moment().endOf('datetime-local').toDate(),
            };
            // whereCondition['updatedAt'] = {
            //     [Sequelize.Op.lte]: moment().endOf('datetime-local').toDate(),
            // };
        }
        else if (body.filter == "week") {
            whereCondition['updatedAt'] = {
                [Sequelize.Op.gte]: moment().startOf('week').toDate(),
                [Sequelize.Op.lte]: moment().endOf('week').toDate(),
            };
        }
        else if (body.filter == "month") {
            whereCondition['updatedAt'] = {
                [Sequelize.Op.gte]: moment().startOf('month').toDate(),
                [Sequelize.Op.lte]: moment().endOf('month').toDate(),
            };
        }
        else if (body.filter == "lastWeek") {
            whereCondition['updatedAt'] = {
                [Sequelize.Op.gte]: moment().startOf('day').subtract(7, 'days').toDate(),
                [Sequelize.Op.lte]: moment().endOf('day').subtract(7, 'days').toDate(),
            }
        }
        else if (body.filter == "lastMonth") {
            whereCondition['updatedAt'] = {
                [Sequelize.Op.gte]: moment().startOf('month').subtract(1, 'months').toDate(),
                [Sequelize.Op.lte]: moment().endOf('month').subtract(1, 'months').toDate(),
            }
        } else if (body.startDate && body.endDate) {
            whereCondition['updatedAt'] = {
                [Sequelize.Op.gte]: moment(body.startDate).startOf('day').toDate(),
                [Sequelize.Op.lte]: moment(body.endDate).endOf('day').toDate(),
            };
        } else if (body.startDate) {
            whereCondition['updatedAt'] = {
                [Sequelize.Op.gte]: moment(body.startDate).startOf('day').toDate()
            }
        }
        // else if(body.filter == "last3month"){
        //     whereCondition['createdAt'] = {
        //         [Sequelize.Op.gte]: moment().startOf('').toDate(),
        //         [Sequelize.Op.lte]: moment().endOf('').toDate(),
        //     };
        // } else if (body.filter == "quarter"){
        //     whereCondition['createdAt'] = {
        //         [Sequelize.Op.gte]: moment().startOf('').toDate(),
        //         [Sequelize.Op.lte]: moment().endOf('').toDate(),
        //     };
        // } else if (body.filter == "halfyear"){
        //     whereCondition['createdAt'] = {
        //         [Sequelize.Op.gte]: moment().startOf('').toDate(),
        //         [Sequelize.Op.lte]: moment().endOf('').toDate(),
        //     };
        // } else if (body.filter == "year"){
        //     whereCondition['createdAt'] = {
        //         [Sequelize.Op.gte]: moment().startOf('').toDate(),
        //         [Sequelize.Op.lte]: moment().endOf('').toDate(),
        //     };
        // }

        const leadScheduledStatusDetail = await Status.findOne({
            where: { name: defaultStatus.scheduled }
        });
        const leadContactedStatusDetail = await Status.findOne({
            where: { name: defaultStatus.contacted }
        });
        const leadRegisteredStatusDetail = await Status.findOne({
            where: { name: defaultStatus.registered }
        });
        if (body.assignedToUserId) {
            whereCondition['assignedToId'] = body.assignedToUserId;
        } else {
            // counts of loggedin user(if it is user)
            if (req.decoded.userId) {
                const userDetail = await User.findOne({
                    where: { id: req.decoded.userId },
                    include: [{
                        model: Role,
                        required: true,
                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                    }]
                });
                if (userDetail.Role.key == defaultRoles.user) {
                    whereCondition['assignedToId'] = req.decoded.userId;
                }
            }
        }

        whereCondition['isDeleted'] = false;
        const newLeadsCount = await Lead.count({
            where: {
                ...whereCondition,
                isTouched: false
            }
        });
        const scheduledLeadsCount = await Lead.count({
            where: {
                ...whereCondition,
                leadStatusId: leadScheduledStatusDetail?.id, scheduleDate: dateInYyyyMmDd(), assignedToId: { [Sequelize.Op.not]: null }
            }
        });
        const closedLeadsCount = await Lead.count({
            where: {
                ...whereCondition,
                leadStatusId: leadContactedStatusDetail?.id
            }
        });
        const oldLeadsCount = await Lead.count({
            where: {
                ...whereCondition,
                leadStatusId: leadScheduledStatusDetail?.id, isTouched: true
            }
        });
        const overdueLeadsCount = await Lead.count({
            where: {
                ...whereCondition,
                leadStatusId: leadScheduledStatusDetail?.id, scheduleDate: { [Sequelize.Op.lt]: dateInYyyyMmDd() }
            }
        });
        const registeredLeadsCount = await Lead.count({
            where: {
                ...whereCondition,
                leadStatusId: leadRegisteredStatusDetail?.id
            }
        });
        const allLeadCount = await Lead.count({
            where:
                whereCondition
        });
        const deletedLeadsCount = await Lead.count({
            where: {
                ...whereCondition,
                isDeleted: true
            }
        });
        return {
            success: true,
            data: {
                newLeadsCount,
                scheduledLeadsCount,
                closedLeadsCount,
                oldLeadsCount,
                overdueLeadsCount,
                registeredLeadsCount,
                allLeadCount,
                deletedLeadsCount
            },
            message: 'Lead Count Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllLeadCount API");
        throw new Error(error);
    }

};
const dataForReports = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 50;
        let whereCondition = {};
        let whoLoggedIn = "admin";
        if (body.assignedToUserId) {
            whereCondition['id'] = body.assignedToUserId;
        } else {
            const userDetail = await User.findOne({
                where: { id: req.decoded.userId },
                include: [{
                    model: Role,
                    required: true,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }]
            });
            if (userDetail.Role.key == defaultRoles.user) {
                whoLoggedIn = "user";
                whereCondition['id'] = req.decoded.userId;
            }
        }
        const where2 = {};
        if (body.filter === 'day') {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('day').toDate(),
                [Sequelize.Op.lte]: moment().endOf('day').toDate(),
            };
        } else if (body.filter === 'week') {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('week').toDate(),
                [Sequelize.Op.lte]: moment().endOf('week').toDate(),
            };
        } else if (body.filter === 'month') {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('month').toDate(),
                [Sequelize.Op.lte]: moment().endOf('month').toDate(),
            };
        } else if (body.startDate && body.endDate) {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
                [Sequelize.Op.lte]: convertToIST(body.endDate),
            };
        } else if (body.startDate) {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
            };
        } else {
            where2['createdAt'] = {
                [Sequelize.Op.lte]: moment().endOf('datetime-local').toDate(),
            };
        }
        const logs = await User.findAll({
            where: whereCondition,
            include: [
                {
                    model: LeadActionLog,
                    where: where2,
                    required: true,
                    as: 'LeadActionLogs',
                    include: [
                        {
                            model: ActionType,
                            required: false,
                            as: 'ActionTypes',
                        },
                        {
                            model: ActionSubType,
                            required: false,
                            as: 'ActionSubType',
                        }
                    ]
                }
            ],
            attributes: ['id', 'name', 'email'],
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
        });


        let userId = []
        await logs.map((item) => {
            userId.push(item.id)
        })
        let countDetail = await LeadActionLog.findAll({
            where: { assignedEmployeeId: { [Sequelize.Op.in]: userId } },
            attributes: ['actionSubTypeId', [Sequelize.fn('count', Sequelize.col('actionSubTypeId')), 'userCount']],
            include: [
                {
                    model: User,
                    required: false,
                    as: 'AssignedEmployee',
                    attributes: ['id'],
                },
            ],
            group: ['actionSubTypeId', 'AssignedEmployee.id'],
            raw: true
        });

        countDetail = countDetail.map(item => ({
            actionSubTypeId: item.actionSubTypeId,
            userCount: item.userCount,
            AssignedEmployeeId: item['AssignedEmployee.id'],
        }));

        countDetail = countDetail.filter((item) => {
            let matched = false;
            logs.forEach((item2) => {
                if (item2.id == item.AssignedEmployeeId) {
                    item2.LeadActionLogs.forEach((item3) => {
                        if (item3.ActionSubType.id == item.actionSubTypeId) {
                            item.createdAt = item3.createdAt;
                            item.AssigneeName = item2.name;
                            item.actionDetail = item3;
                            matched = true;
                        }
                    });
                }
            });
            return matched;
        });


        return {
            success: true,
            data: countDetail,
            message: 'Action Type Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in dataForReports API");
        throw new Error(error);
    }
};
const downloadReportInExcel = async (req, res) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 50;
        let whereCondition = {};
        let whoLoggedIn = "admin";
        if (body.assignedToUserId) {
            whereCondition['id'] = body.assignedToUserId;
        } else {
            const userDetail = await User.findOne({
                where: { id: req.decoded.userId },
                include: [{
                    model: Role,
                    required: true,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }]
            });
            if (userDetail.Role.key == defaultRoles.user) {
                whoLoggedIn = "user";
                whereCondition['id'] = req.decoded.userId;
            }
        }
        const where2 = {};
        if (body.filter === 'day') {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('day').toDate(),
                [Sequelize.Op.lte]: moment().endOf('day').toDate(),
            };
        } else if (body.filter === 'week') {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('week').toDate(),
                [Sequelize.Op.lte]: moment().endOf('week').toDate(),
            };
        } else if (body.filter === 'month') {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('month').toDate(),
                [Sequelize.Op.lte]: moment().endOf('month').toDate(),
            };
        } else if (body.startDate && body.endDate) {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
                [Sequelize.Op.lte]: convertToIST(body.endDate),
            };
        } else if (body.startDate) {
            where2['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
            };
        } else {
            where2['createdAt'] = {
                [Sequelize.Op.lte]: moment().endOf('datetime-local').toDate(),
            };
        }
        const logs = await User.findAll({
            where: whereCondition,
            include: [
                {
                    model: LeadActionLog,
                    where: where2,
                    required: true,
                    as: 'LeadActionLogs',
                    include: [
                        {
                            model: ActionType,
                            required: false,
                            as: 'ActionTypes',
                        },
                        {
                            model: ActionSubType,
                            required: false,
                            as: 'ActionSubType',
                        }
                    ]
                }
            ],
            attributes: ['id', 'name', 'email'],
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
        });


        let userId = []
        await logs.map((item) => {
            userId.push(item.id)
        })
        let countDetail = await LeadActionLog.findAll({
            where: { assignedEmployeeId: { [Sequelize.Op.in]: userId } },
            attributes: ['actionSubTypeId', [Sequelize.fn('count', Sequelize.col('actionSubTypeId')), 'userCount']],
            include: [
                {
                    model: User,
                    required: false,
                    as: 'AssignedEmployee',
                    attributes: ['id'],
                },
            ],
            group: ['actionSubTypeId', 'AssignedEmployee.id'],
            raw: true
        });

        countDetail = countDetail.map(item => ({
            actionSubTypeId: item.actionSubTypeId,
            userCount: item.userCount,
            AssignedEmployeeId: item['AssignedEmployee.id'],
        }));

        countDetail = countDetail.filter((item) => {
            let matched = false;
            logs.forEach((item2) => {
                if (item2.id == item.AssignedEmployeeId) {
                    item2.LeadActionLogs.forEach((item3) => {
                        if (item3.ActionSubType.id == item.actionSubTypeId) {
                            item.createdAt = item3.createdAt;
                            item.AssigneeName = item2.name;
                            item.actionDetail = item3;
                            matched = true;
                        }
                    });
                }
            });
            return matched;
        });
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reports Data', {
            properties: { tabColor: { argb: 'FFC0000' } },
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Date', key: 'createdAt', width: 15 },
            { header: 'Action Type', key: 'actionType', width: 20 },
            { header: 'Action SubType', key: 'actionSubType', width: 30 },
            { header: 'Total Count', key: 'count', width: 15 }
        ];
        countDetail.map((item) => {
            worksheet.addRow({
                name: item.AssigneeName,
                createdAt: dateInDdMmYyyy(item.createdAt),
                actionType: item.actionDetail.ActionTypes.displayName,
                actionSubType: item.actionDetail.ActionSubType.displayName,
                count: item.userCount
            });
        });
        worksheet.getRow(1).font = { bold: true };
        for (const column of worksheet.columns) {
            column.alignment = { wrapText: true };
        }
        const fileName = `Reports-${Date.now()}.xlsx`;
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.log(error, "Error in dataForReports API");
        throw new Error(error);
    }
};

const sendMail = async (req) => {
    try {
        const body = req.body;
        const leadDetail = await Lead.findOne({
            where: { id: body.leadId }
        });
        if (!leadDetail) {
            return {
                success: false,
                data: null,
                message: 'Lead does not exist. Please enter a valid Lead'
            };
        };
        const userDetail = await User.findOne({
            where: { id: leadDetail.assignedToId }
        });

        const actionTypeDetail = await ActionType.findOne({
            where: { name: actionTypes.email }
        });
        const actionSubTypeDetail = await ActionSubType.findOne({
            where: { name: actionSubTypes.emailsent }
        });
        const attachment = req.files;
        writeFiles(attachment, mailAttachmentsDirectory);
        const attachments = [];
        if (attachment && attachment.length > 0) {
            attachment.map((item) => {
                attachments.push({ path: path.resolve(mailAttachmentsDirectory, item.originalname) });
            })

        }
        const mailOptions = {
            from: '"MyCrm Instep Technologies" < ' + process.env.EMAIL + '>',
            to: body.toEmail ? body.toEmail : req.decoded.email,
            cc: body.cc,
            bcc: body.bcc,
            subject: body.subject,
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Awesome Email</title>
            </head>
            <body>
                <!-- h1>Hello Beautiful!</h1-->
                <!--img src="cid:attachment" alt="Embedded Image"-->
                ${body.message}
                <p>Thank you for reading!</p>
            </body>
            </html>`,
            attachments
            // attachments =[
            //     {
            //         // filename: 'attachment.jpg', // to directly send attatchment without saving
            //         // cid: 'attachment' // should be as per the cid in the html content // html me jaha image attatch krni hao waha cid:attachment likhna hoga
            //         path: `${mailAttachmentsDirectory}/${fileName}`
            //     }
            // ]
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error, "Mail sending error");
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        await LeadActionLog.create({
            leadId: body.leadId,
            actionTypeId: actionTypeDetail?.id,
            actionSubTypeId: actionSubTypeDetail?.id,
            logDescription: "Email Sent Successfully to " + body.toEmail,
            assignedEmployeeId: userDetail?.id,
            leadStatusId: null,
            isDeleted: false
        });
        return {
            success: true,
            message: `Mail Sent Successfully`,
            // recipients:recipients
        };
    } catch (error) {
        console.log(error, "Error in sendMail API");
        throw new Error(error);
    }
};
const createEmailTemplate = async (req) => {
    const t = await sequelize.transaction();
    try {
        const body = req.body;
        const attachment = req.files;
        const emailTemplateDetail = await EmailTemplate.findOne({
            where: { subject: body.subject }
        });
        if (emailTemplateDetail) {
            return {
                success: false,
                data: null,
                message: 'Email Template already exists. Please enter a new Email Template Name'
            };
        };
        const newEmailTemplate = await EmailTemplate.create({
            subject: body.subject,
            message: body.message
        }, { transaction: t });
        if (attachment && attachment.length > 0) {
            for (const item of attachment) {
                await EmailTemplateAttachment.create({
                    templateId: newEmailTemplate.id,
                    attachment: item.originalname
                },
                    { transaction: t }
                );
            };
            await writeFiles(attachment, mailTemplateAttachmentsDirectory);
        };
        await t.commit();
        return {
            success: true,
            data: newEmailTemplate,
            message: 'Email Template Created Successfully',
        };
    }
    catch (error) {
        await t.rollback();
        console.log(error, "Error in createEmailTemplate API");
        throw new Error(error);
    }
};
const getAllEmailTemplates = async (req) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        const emailTemplates = await EmailTemplate.findAndCountAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    model: EmailTemplateAttachment,
                    required: false,
                    as: 'EmailTemplateAttachment',
                }
            ],
            order: [['id', 'ASC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        return {
            success: true,
            data: emailTemplates,
            message: 'Email Templates Fetched Successfully'
        };
    } catch (error) {
        console.log(error, "Error in getAllEmailTemplates API");
        throw new Error(error);
    }
};
const getEmailTemplateDetail = async (req) => {
    try {
        const body = req.body;
        const emailTemplateDetail = await EmailTemplate.findOne({
            where: { id: body.emailTemplateId },
            include: [
                {
                    model: EmailTemplateAttachment,
                    required: false,
                    as: 'EmailTemplateAttachment'
                }
            ]
        });
        if (!emailTemplateDetail) {
            return {
                success: false,
                data: null,
                message: 'No Email Template is associated with this id. Please enter a valid id'
            };
        }
        return {
            success: true,
            data: emailTemplateDetail,
            message: 'Email Template Fetched Successfully'
        };
    }
    catch (error) {
        console.log(error, "Error in getEmailTemplateDetail API");
        throw new Error(error);
    }
};
const updateEmailTemplate = async (req) => {
    const t = await sequelize.transaction();
    try {
        const body = JSON.parse(req.body.profileData);
        const attachment = req.files;
        const emailTemplateDetail = await EmailTemplate.findOne({
            where: { id: body.emailTemplateId }
        });
        if (!emailTemplateDetail) {
            return {
                success: false,
                data: null,
                message: 'No Email Template is associated with this id. Please enter a valid id'
            };
        };
        const updatedEmailTemplate = await EmailTemplate.update({
            subject: body.subject,
            message: body.message
        }, {
            where: { id: body.emailTemplateId }, returning: true, transaction: t
        }
        );
        if (attachment && attachment.length > 0) {
            await writeFiles(attachment, mailTemplateAttachmentsDirectory);
            for (const item of attachment) {
                await EmailTemplateAttachment.create({
                    templateId: body.emailTemplateId,
                    attachment: item.originalname
                },
                    { transaction: t }
                );
            };
        };
        // no need to delete the attatchments from here as, we have deleteEmailTemplateImage APi for that
        // body.fileNamesToDelete.map(async (item) => {
        //     await EmailTemplateAttachment.destroy({
        //         where: { attachment: item },
        //         transaction: t
        //     });
        // })
        // await deleteFiles(body.fileNamesToDelete, mailTemplateAttachmentsDirectory);
        // "fileNamesToDelete": ["Helpyfi-17876545678.png","Master-8765678976.png"]
        await t.commit();
        return {
            success: true,
            data: updatedEmailTemplate,
            message: 'Email Template Updated Successfully'
        };
    } catch (error) {
        await t.rollback();
        console.log(error, "Error in updateEmailTemplate API");
        throw new Error(error);
    }
};
const deleteEmailTemplateImage = async (req) => {
    try {
        const imageId = req.body.id;
        const emailTemplateDetail = await EmailTemplateAttachment.findOne({
            where: { id: imageId }
        });
        if (!emailTemplateDetail) {
            return {
                success: false,
                data: null,
                message: 'No Email Template is associated with this id. Please enter a valid id'
            };
        }
        await deleteFiles(mailTemplateAttachmentsDirectory, emailTemplateDetail.attachment);
        const deletedEmailTemplateImage = await EmailTemplateAttachment.destroy({
            where: { id: imageId }
        });
        return {
            success: true,
            data: deletedEmailTemplateImage,
            message: 'Email Template Image Deleted Successfully'
        };
    }
    catch (error) {
        console.log(error, "Error in deleteEmailTemplateImage API");
        throw new Error(error);
    }
};
const deleteEmailTemplate = async (req) => {
    try {
        const body = req.body;
        const emailTemplateDetail = await EmailTemplate.findOne({
            where: { id: body.emailTemplateId }
        });
        if (!emailTemplateDetail) {
            return {
                success: false,
                data: null,
                message: 'No Email Template is associated with this id. Please enter a valid id'
            };
        }
        const emailTemplateAttachments = await EmailTemplateAttachment.findAll({
            where: { templateId: body.emailTemplateId }
        });
        await Promise.all(emailTemplateAttachments.map(async (item) => {
            await deleteFiles(mailTemplateAttachmentsDirectory, item.attachment);
        }));

        await EmailTemplateAttachment.destroy({
            where: { templateId: body.emailTemplateId }
        })
        const deletedEmailTemplate = await EmailTemplate.destroy({
            where: { id: body.emailTemplateId }
        });
        return {
            success: true,
            data: deletedEmailTemplate,
            message: 'Email Template Deleted Successfully'
        };
    }
    catch (error) {
        console.log(error, "Error in deleteEmailTemplate API");
        throw new Error(error);
    }
};
const downloadLeadDataInExcel = async (req, res) => {
    try {
        const body = req.body;
        const pageNo = body.pageNo ? body.pageNo : 1;
        const size = body.pageSize ? body.pageSize : 10;
        let where = {};
        let whoLoggedIn = "admin";

        if (req.body.search) {
            where[Sequelize.Op.and] = [
                Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('Lead.name')),
                    {
                        [Sequelize.Op.like]: `%${req.body.search.toLowerCase()}%`,
                    }
                )
            ]
        }
        if (body.leadTaskCategoryId) {
            where['leadTaskCategoryId'] = body.leadTaskCategoryId;
        }
        if (body.assignedToUserId) {
            where['assignedToId'] = body.assignedToUserId;
        } else {
            const userDetail = await User.findOne({
                where: { id: req.decoded.userId },
                include: [{
                    model: Role,
                    required: true,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }]
            });
            if (userDetail.Role.key == defaultRoles.user) {
                whoLoggedIn = "user";
                where['assignedToId'] = req.decoded.userId;
            }
        }
        if (body.filter === 'day') {
            where['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('day').toDate(),
                [Sequelize.Op.lte]: moment().endOf('day').toDate(),
            };
        } else if (body.filter === 'week') {
            where['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('week').toDate(),
                [Sequelize.Op.lte]: moment().endOf('week').toDate(),
            };
        } else if (body.filter == 'month') {
            where['createdAt'] = {
                [Sequelize.Op.gte]: moment().startOf('month').toDate(),
                [Sequelize.Op.lte]: moment().endOf('month').toDate(),
            };
        } else if (body.filter == "new") {
            // for new leads, only want those which are not touched(not rescheudled or closed(lead status = contacted))
            where['isTouched'] = false;
        } else if (body.filter == 'old') {
            // leads which are scheduled and touched.
            const leadStatusDetail = await Status.findOne({
                where: { name: defaultStatus.scheduled }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
            where['isTouched'] = true;
        } else if (body.startDate && body.endDate) {
            where['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
                [Sequelize.Op.lte]: convertToIST(body.endDate),
            };
        } else if (body.startDate) {
            where['createdAt'] = {
                [Sequelize.Op.gte]: convertToIST(body.startDate),
            };
        } else {
            where['createdAt'] = {
                [Sequelize.Op.lte]: moment().endOf('datetime-local').toDate(),
            };
        }
        if (body.leadStatus == defaultStatus.contacted) {
            const leadStatusDetail = await Status.findOne({
                where: { name: body.leadStatus }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
        } else if (body.leadStatus == defaultStatus.scheduled) {
            // only assigned and scheduled leads show up in scheduled leads list in dashboard
            // only today's leads will show up
            const leadStatusDetail = await Status.findOne({
                where: { name: body.leadStatus }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
            if (!body.assignedToUserId) {
                if (whoLoggedIn == "admin") {
                    // if admin is loggedin then all leads will show up but we want only assigned leads
                    where['assignedToId'] = { [Sequelize.Op.not]: null }
                }
            }
            where['scheduleDate'] = dateInYyyyMmDd();
        } else if (body.leadStatus == "overdue") {
            // not touched leads which are scheduled for past dates//// missed, scheduled leads
            const leadStatusDetail = await Status.findOne({
                where: { name: defaultStatus.scheduled }
            });
            where['leadStatusId'] = leadStatusDetail?.id;
            where['scheduleDate'] = {
                [Sequelize.Op.lt]: dateInYyyyMmDd()
            };
        }
        if (body.assigned) {
            where['assignedToId'] = { [Sequelize.Op.not]: null }
        } else if (body.unassigned) {
            where['assignedToId'] = null
        }
        if (body.scheduleDate) {
            where['scheduleDate'] = body.scheduleDate;
        }
        if (body.isDeleted) {
            where['isDeleted'] = body.isDeleted;
        } else {
            where['isDeleted'] = false;
        }
        const leadData = await Lead.findAll({
            where: where,
            include: [
                {
                    model: MasterData,
                    as: 'LeadSource',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadTaskCategory,
                    as: 'LeadTaskCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: Status,
                    as: 'LeadStatus',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: User,
                    as: 'AssignedTo',
                    include: [
                        {
                            model: DesignationList,
                            as: 'Designation',
                            include: [
                                {
                                    model: DepartmentList,
                                    as: 'Department',
                                    attributes: { exclude: ['id', 'name', 'createdAt', 'updatedAt'] }
                                }
                            ],
                            attributes: { exclude: ['id', 'name', 'departmentId', 'createdAt', 'updatedAt'] }
                        }
                    ],
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                // {
                //     model: User,
                //     as: 'DeletedByUserName',
                //     attributes: { exclude: ['createdAt', 'updatedAt'] }
                // },
                {
                    model: CompanyCategory,
                    as: 'CompanyCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadTaskSubCategory,
                    as: 'LeadTaskSubCategory',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    as: 'CompanySize',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    as: 'ScheduledType',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: MasterData,
                    as: 'LeadDuration',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: LeadActionLog,
                    as: 'LeadActionLog',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }
            ],
            // attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['id', 'DESC']],
            offset: (pageNo - 1) * size,
            limit: size,
            distinct: true,
        });
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Lead Data', {
            properties: { tabColor: { argb: 'FFC0000' } },
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });
        worksheet.columns = [
            { header: 'Lead Id', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Personal Email', key: 'personalEmail', width: 30 },
            { header: 'Personal Number', key: 'personalMobile', width: 15 },
            { header: 'Personal Address', key: 'personalAddress', width: 20 },
            { header: 'Company Name', key: 'companyName', width: 20 },
            { header: 'Company Email', key: 'companyEmail', width: 30 },
            { header: 'Company Mobile', key: 'companyMobile', width: 20 },
            { header: 'Website', key: 'website', width: 20 },
            { header: 'Twitter', key: 'twitter', width: 20 },
            { header: 'LinkedIn', key: 'linkedIn', width: 20 },
            { header: 'Company Address', key: 'companyAddress', width: 20 },
            { header: 'Postal Code', key: 'postalCode', width: 20 },
            { header: 'Company Size', key: 'companySizeId', width: 20 },
            { header: 'Company Type', key: 'companyTypeId', width: 20 },
            { header: 'Country', key: 'country', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'City', key: 'city', width: 20 },
            { header: 'Lead Source', key: 'leadSourceId', width: 20 },
            { header: 'Lead Task Category', key: 'leadTaskCategoryId', width: 20 },
            { header: 'Lead Task Sub Category', key: 'leadTaskSubCategoryId', width: 20 },
            { header: 'Lead Duration', key: 'leadDurationId', width: 20 },
            { header: 'Budget', key: 'budget', width: 20 },
            { header: 'Description', key: 'description', width: 20 },
            { header: 'Lead Schedule Date', key: 'scheduleDate', width: 20 },
            { header: 'Assignee`s Department', key: 'depertmentId', width: 20 },
            { header: 'Assignee`s Designation', key: 'designationId', width: 20 },
            { header: 'Assignee`s Name', key: 'assignedToId', width: 20 },
            { header: 'Delete Status', key: 'isDeleted', width: 20 },
            // { header: 'Deleted By', key: 'deletedByUserName', width: 20 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Updated At', key: 'updatedAt', width: 20 }
        ];
        leadData.map((leadDataObj) => {
            worksheet.addRow({
                id: leadDataObj.id,
                name: leadDataObj.name,
                personalEmail: leadDataObj.personalEmail,
                personalMobile: leadDataObj.personalMobile,
                personalAddress: leadDataObj.personalAddress,
                companyName: leadDataObj.companyName,
                companyEmail: leadDataObj.companyEmail,
                companyMobile: leadDataObj.companyMobile,
                website: leadDataObj.website,
                twitter: leadDataObj.twitter,
                linkedIn: leadDataObj.linkedIn,
                companyAddress: leadDataObj.companyAddress,
                postalCode: leadDataObj.postalCode,
                companySizeId: leadDataObj.CompanySize?.displayName,
                companyTypeId: leadDataObj.CompanyCategory?.displayName,
                country: leadDataObj.country,
                state: leadDataObj.state,
                city: leadDataObj.city,
                leadSourceId: leadDataObj.LeadSource?.displayName,
                leadTaskCategoryId: leadDataObj.LeadTaskCategory?.displayName,
                leadTaskSubCategoryId: leadDataObj.LeadTaskSubCategory?.displayName,
                leadDurationId: leadDataObj.LeadDuration?.displayName,
                budget: leadDataObj.budget,
                description: leadDataObj.description,
                scheduleDate: leadDataObj.scheduleDate,
                depertmentId: leadDataObj.AssignedTo?.Designation?.Department?.displayName,
                designationId: leadDataObj.AssignedTo?.Designation?.displayName,
                assignedToId: leadDataObj.AssignedTo?.name,
                isDeleted: leadDataObj.isDeleted,
                // deletedByUserName: leadDataObj.DeletedByUserName?.name,
                createdAt: leadDataObj.createdAt.toLocaleString(),
                updatedAt: leadDataObj.updatedAt.toLocaleString()
            });
        });
        worksheet.getRow(1).font = { bold: true };
        for (const column of worksheet.columns) {
            column.alignment = { wrapText: true };
        }
        const fileName = `LeadData-${Date.now()}.xlsx`;
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.log(error, "error in downloadLeadDataInExcel API")
        throw new Error(error);
    };
};
const downloadSampleExcelForCreateLead = async (req, res) => {
    try {
        // const companySize = await MasterData.findAll({ where: { types: "companySize" } });
        // const companySizeArray = companySize.map(item => item.displayName).join(',');

        // const companyType = await CompanyCategory.findAll({});
        // const companyTypeArray = companyType.map(item => item.displayName).join(',');

        // const leadSource = await MasterData.findAll({ where: { types: "leadSource" } });
        // const leadSourceArray = leadSource.map(item => item.displayName).join(',');

        // const leadDuration = await MasterData.findAll({ where: { types: "leadDuration" } });
        // const leadDurationArray = leadDuration.map(item => item.displayName).join(',');

        // const leadTaskCategory = await LeadTaskCategory.findAll({});
        // const leadTaskCategoryArray = leadTaskCategory.map(item => item.displayName).join(',');

        // const leadTaskSubCategory = await LeadTaskSubCategory.findAll({});
        // const leadTaskSubCategoryArray = leadTaskSubCategory.map(item => item.displayName).join(',');

        const leadStatus = await Status.findAll({ where: { types: "lead" } });
        const leadStatusArray = leadStatus.map(item => item.displayName).join(',');

        // const users = await User.findAll({});
        // const usersArray = users.map(item => item.name).join(',');

        // const scheduledTypes = await MasterData.findAll({ where: { types: "scheduledType" } });
        // const scheduledTypesArray = scheduledTypes.map(item => item.displayName).join(',');

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Lead Sample Sheet');
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'PersonalEmail', key: 'personalEmail', width: 30 },
            { header: 'PersonalNumber', key: 'personalMobile', width: 15 },
            { header: 'PersonalAddress', key: 'personalAddress', width: 20 },
            { header: 'CompanyName', key: 'companyName', width: 20 },
            { header: 'CompanyEmail', key: 'companyEmail', width: 30 },
            { header: 'CompanyMobile', key: 'companyMobile', width: 20 },
            { header: 'CompanyAddress', key: 'companyAddress', width: 20 },
            // { header: 'CompanySize', key: 'companySizeId', width: 20 },
            // { header: 'CompanyType', key: 'companyTypeId', width: 20 },
            { header: 'Website', key: 'website', width: 20 },
            { header: 'Twitter', key: 'twitter', width: 20 },
            { header: 'LinkedIn', key: 'linkedIn', width: 20 },
            { header: 'Facebook', key: 'facebook', width: 20 },
            { header: 'PostalCode', key: 'postalCode', width: 20 },
            { header: 'Country', key: 'country', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'City', key: 'city', width: 20 },
            { header: 'Budget', key: 'budget', width: 20 },
            // { header: 'LeadSource', key: 'leadSourceId', width: 20 },
            // { header: 'LeadDuration', key: 'leadDurationId', width: 20 },
            // { header: 'LeadTaskCategory', key: 'leadTaskCategoryId', width: 20 },
            // { header: 'LeadTaskSubCategory', key: 'leadTaskSubCategoryId', width: 20 },
            // { header: 'LeadStatus', key: 'leadStatusId', width: 20 },
            // { header: 'AssigneeName', key: 'assignedToId', width: 20 },
            // { header: 'LeadScheduleDate', key: 'scheduleDate', width: 20 },
            // { header: 'LeadScheduleType', key: 'leadScheduleTypeId', width: 20 },
            { header: 'Description', key: 'description', width: 20 },
            // { header: 'Deleted', key: 'isDeleted', width: 20 },
            // { header: 'DeletedByUserName', key: 'deletedByUserName', width: 20 },
            // { header: 'EverWorkedOnThisLead', key: 'isTouched', width: 20 },
        ];
        worksheet.getRow(1).font = { bold: true };
        // worksheet.getCell('I2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${companySizeArray}"`],
        // };
        // worksheet.getCell('J2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${companyTypeArray}"`]
        // };
        // worksheet.getCell('T2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${leadSourceArray}"`]
        // };
        // worksheet.getCell('U2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${leadDurationArray}"`]
        // };
        // worksheet.getCell('V2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${leadTaskCategoryArray}"`]
        // };
        // worksheet.getCell('W2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${leadTaskSubCategoryArray}"`]
        // };
        // worksheet.getCell('X2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${leadStatusArray}"`]
        // };
        // worksheet.getCell('Y2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${usersArray}"`]
        // };
        // worksheet.getCell('Z2').dataValidation = {
        //     type: 'date',
        //     operator: 'between',
        //     formulae: ['1900-01-01', '2100-12-31'],
        //     allowBlank: true,
        //     promptTitle: 'Date Validation',
        //     prompt: 'Please enter a valid date between 1900-01-01 and 2100-12-31. Date format = yyyy-mm-dd',
        //     showInputMessage: true,
        //     showErrorMessage: true,
        // };
        // worksheet.getCell('AA2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${scheduledTypesArray}"`]
        // };
        // worksheet.getCell('AC2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: ['"true,false"']
        // };
        // worksheet.getCell('AD2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: [`"${usersArray}"`]
        // };
        // worksheet.getCell('AE2').dataValidation = {
        //     type: 'list',
        //     allowBlank: true,
        //     formulae: ['"true,false"']
        // };
        const fileName = `LeadSampleSheet-${Date.now()}.xlsx`;
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.log(error, "error in downloadSampleExcelForCreateLead API")
        throw new Error(error);
    };
};
const createLeadsByExcel = async (req) => {
    try {
        const file = req.file;
        if (file) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const wsname = workbook.SheetNames[0];
            const ws = workbook.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            let leads = [];
            // console.log(data, 'data in createLeadsByExcel API');
            await Promise.all(
                data.map(async (item) => {
                    let lead = {
                        name: item.Name,
                        personalEmail: item.PersonalEmail,
                        personalMobile: item.PersonalNumber,
                        personalAddress: item.PersonalAddress,
                        companyName: item.CompanyName,
                        companyEmail: item.CompanyEmail,
                        companyMobile: item.CompanyMobile,
                        companyAddress: item.CompanyAddress,
                        postalCode: item.PostalCode,
                        website: item.Website,
                        twitter: item.Twitter,
                        linkedIn: item.LinkedIn,
                        facebook: item.Facebook,
                        country: item.Country,
                        city: item.City,
                        state: item.State,
                        budget: item.Budget,
                        // scheduleDate: item.LeadScheduleDate ? dateInYyyyMmDd(ExcelDateToJSDate(item.LeadScheduleDate)) : null,
                        description: item.Description,
                        isDeleted: item.Deleted ? item.isDeleted : false,
                        isTouched: item.EverWorkedOnThisLead ? item.EverWorkedOnThisLead : false
                    };
                    // if (item.CompanySize) {
                    //     const companySize = await MasterData.findOne({ where: { types: "companySize", displayName: item.CompanySize } });
                    //     lead.companySize = companySize?.id
                    // };

                    // if (item.CompanyType) {
                    //     const companyType = await CompanyCategory.findOne({ where: { displayName: item.CompanyType } });
                    //     lead.companyTypeId = companyType?.id
                    // };

                    // if (item.LeadSource) {
                    //     const leadSource = await MasterData.findOne({ where: { types: "leadSource", displayName: item.LeadSource } });
                    //     lead.leadSourceId = leadSource?.id
                    // };

                    // if (item.LeadDuration) {
                    //     const leadDuration = await MasterData.findOne({ where: { types: "leadDuration", displayName: item.LeadDuration } });
                    //     lead.leadDurationId = leadDuration?.id
                    // };

                    // if (item.LeadTaskCategory) {
                    //     const leadTaskCategory = await LeadTaskCategory.findOne({ where: { displayName: item.LeadTaskCategory } });
                    //     lead.leadTaskCategoryId = leadTaskCategory?.id
                    // };

                    // if (item.LeadTaskSubCategory) {
                    //     const leadTaskSubCategory = await LeadTaskSubCategory.findOne({ where: { displayName: item.LeadTaskSubCategory } });
                    //     lead.leadTaskSubCategoryId = leadTaskSubCategory?.id
                    // };

                    if (item.LeadStatus) {
                        const leadStatus = await Status.findOne({ where: { types: "lead", displayName: item.LeadStatus } });
                        lead.leadStatusId = leadStatus?.id
                    } else {
                        const leadStatus = await Status.findOne({ where: { types: "lead", name: defaultStatus.pending } });
                        lead.leadStatusId = leadStatus?.id
                    }

                    // if (item.AssigneeName) {
                    //     const users = await User.findOne({ where: { name: item.AssigneeName } });
                    //     lead.assignedToId = users?.id
                    // };

                    // if (item.LeadScheduleType) {
                    //     const leadScheduledType = await MasterData.findOne({ where: { types: "scheduledType", displayName: item.LeadScheduleType } });
                    //     lead.scheduledTypeId = leadScheduledType?.id
                    // };

                    // if (item.DeletedByUserName) {
                    //     const userSForDeletedBy = await User.findOne({ where: { name: item.DeletedByUserName } });
                    //     lead.deletedByUserName = userSForDeletedBy?.id
                    // };

                    const userDetail = await User.findOne({
                        where: { id: req.decoded.userId },
                        include: [{
                            model: Role,
                            required: true,
                            attributes: { exclude: ['createdAt', 'updatedAt'] }
                        }]
                    });
                    if (userDetail.Role.key == defaultRoles.user) {
                        whoLoggedIn = "user";
                        lead['assignedToId'] = req.decoded.userId;
                    }
                    leads.push(lead);
                }));
            await Lead.bulkCreate(leads);
            return { success: true, message: 'Leads Created Successfully' };
        };
        return { success: false, message: 'No file found' };
    } catch (error) {
        console.log(error, 'error in createLeadsByExcel API');
        throw new Error(error);
    }
};
const downloadSampleExcelForCreateUser = async (req, res) => {
    try {
        const roles = await Role.findAll({});
        const rolesArray = roles.map(item => item.title).join(',');

        const designations = await DesignationList.findAll({});
        const designationsArray = designations.map(item => item.displayName).join(',');

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('User Sample Sheet');
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Mobile', key: 'mobile', width: 15 },
            { header: 'Password', key: 'password', width: 20 },
            { header: 'Role', key: 'roleId', width: 20 },
            { header: 'Designation', key: 'designationId', width: 20 },
            { header: 'EmployeeId', key: 'employeeId', width: 20 },
            { header: 'Skype', key: 'skype', width: 20 },
            { header: 'Address', key: 'address', width: 20 },
            { header: 'ProfileImage', key: 'profileImage', width: 20 },
        ];
        worksheet.getRow(1).font = { bold: true };
        worksheet.getCell('E2').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${rolesArray}"`],
        };
        worksheet.getCell('F2').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${designationsArray}"`]
        };
        const fileName = `UserSampleSheet-${Date.now()}.xlsx`;
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.log(error, "error in downloadSampleExcelForCreateUser API")
        throw new Error(error);
    };
};
const createUsersByExcel = async (req) => {
    try {
        const file = req.file;
        if (file) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const wsname = workbook.SheetNames[0];
            const ws = workbook.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            let users = [];
            let errors = [];
            await Promise.all(
                data.map(async (item) => {
                    if (item.Email) {
                        const userDetail = await User.findOne({ where: { email: item.Email } });
                        if (userDetail) {
                            errors.push({ success: false, message: `User with email=${item.Email} already exists` });
                            return;
                        }
                    }
                    let user = {
                        profileImage: item.ProfileImage,
                        name: item.Name,
                        email: item.Email,
                        mobile: item.Mobile,
                        password: item.Password,
                        roleId: item.Role,
                        designationId: item.Designation,
                        employeeId: item.EmployeeId,
                        skype: item.Skype,
                        address: item.Address
                    };
                    if (item.Role) {
                        const role = await Role.findOne({ where: { title: item.Role } });
                        user.roleId = role?.id;
                    }
                    if (item.Designation) {
                        const designation = await DesignationList.findOne({ where: { displayName: item.Designation } });
                        user.designationId = designation?.id;
                    }
                    users.push(user);
                })
            );
            if (errors.length > 0) {
                return { success: false, errors };
            }
            await User.bulkCreate(users);
            return { success: true, message: 'Users Created Successfully' };
        }
        return { success: false, message: 'No file found' };
    } catch (error) {
        console.log(error, 'error in createUsersByExcel API');
        throw new Error(error);
    }
};





module.exports = {
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserDetail,
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
    downloadLeadDataInExcel,
    downloadSampleExcelForCreateLead,
    createLeadsByExcel,
    downloadSampleExcelForCreateUser,
    createUsersByExcel
}