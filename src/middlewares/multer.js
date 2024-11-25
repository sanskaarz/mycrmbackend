const multer = require('multer');
const path = require('path');

function initializeMulter({ fileSizeLimit, fileTypes = null }) {

  const fileFilter = fileTypes ? (req, file, cb) => {
    if (file.originalname.match(new RegExp(`\.(${fileTypes.join('|')})$`))) {
      cb(null, true);
    } else {
      cb(new Error(`Please upload a file, in ${fileTypes.reduce((types, item) => types += " or " + item)} format.`), false);
    };
  } : undefined;

  const multerOptions = {
    fileFilter: fileFilter,
  };
  if (fileSizeLimit) {
    multerOptions.limits = { fileSize: fileSizeLimit };
  };
  return multer(multerOptions);
};

function fileUpload(fieldName, options = {}) {
  return function (req, res, next) {
    const { multiple = false, maxCount = 1, fileSizeLimit, fileTypes } = options;
    const upload = initializeMulter({ fileSizeLimit, fileTypes });

    const uploadHandler = multiple ? upload.array(fieldName, maxCount) : upload.single(fieldName);

    uploadHandler(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(200).json({ success: false, message: `Unexpected field or count received. Please check the attachement count and field name.` });
        };
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(200).json({ success: false, message: `Attachment size limit exceeded (Max limit: ${fileSizeLimit / 1048576} MB)` });
        };
      } else if (err) {
        return res.status(200).json({ success: false, message: err.message });
      };
      next();
    });
  };
};

module.exports = { fileUpload };