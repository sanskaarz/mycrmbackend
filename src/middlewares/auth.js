const httpStatus = require('http-status');
const jwtToken = require('../utils/auth');
const { roleAccess } = require('../../config/roles');
const { User, Role } = require('../../models');

module.exports = function (req, res, next) {
  if (req.headers.authorization) {
    let token = null;
    const authorization = req.headers.authorization.split(' ');
    if (authorization.length === 2) {
      const key = authorization[0];
      const val = authorization[1];
      if (/^Bearer$/i.test(key)) {
        token = val.replace(/"/g, '');
        if (token) {
          jwtToken.verifyToken(token, async function (err, decoded) {
            if (err) {
              return res.json({ success: false, message: 'You are not authenticated! Please Login First' });
            }
            req.decoded = decoded;
            let userDetail = null;
            userDetail = await User.findOne({
              where: { id: req.decoded.userId },
              include: [
                {
                  model: Role,
                  attributes: ['key'],
                },
              ],
            });
            if (userDetail) {
              const accessApis = roleAccess[userDetail.Role.key];
              if (accessApis && accessApis.length > 0) {
                if (accessApis.indexOf(req.route.path) > -1) {
                  next();
                } else {
                  res.status(httpStatus.UNAUTHORIZED).send('You have no access for this api');
                }
              } else {
                res.status(httpStatus.UNAUTHORIZED).send('You have no access for this api');
              }
            } else {
              res.status(httpStatus.UNAUTHORIZED).send('Invalid Token');
            }
          });
        }
      }
    } else {
      res.status(httpStatus.UNAUTHORIZED).send('You are not authorized to perform this operation!');
    }
  } else {
    res.status(httpStatus.UNAUTHORIZED).send('You are not authorized to perform this operation!');
  }
};
