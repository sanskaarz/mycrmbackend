const Joi = require('joi');

const login = {
  body: Joi.object().keys({
    email: Joi.string().label('email').required().email(),
    password: Joi.string().label('password').required(),
  }),
};

module.exports = { login };