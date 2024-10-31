const Joi = require('joi');


const VALIDATE_CREATE_USER_SCHEMA = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  userName: Joi.string()
    .required(),

  password: Joi.string()
    .required()
});

module.exports = {
  VALIDATE_CREATE_USER_SCHEMA
}