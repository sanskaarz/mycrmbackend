const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const verifyToken = function (token, callback) {
    return jwt.verify(
        token,
        config.jwt.secret,
        {},
        callback
    );
};

const decodeToken = function (token) {
    var decoded = jwt.decode(token);
    return decoded;
};

const generateToken = async (user, role) => {
    const token = jwt.sign(
        {
            userId: user.id,
            name: user.name,
            email: user.email,
            pendingSteps: user.pendingSteps,
            role: role.key,
            aud: 'Sanskar',
            iss: 'MYCRM',
        },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpirationTime }
    );
    return token;
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
};
