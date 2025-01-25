const Joi = require('joi');

const EMAIL_SCHEMA = Joi.string().email()

const USERNAME_SCHEMA = Joi.string().required().messages({
  'string.base': `"userName" must be a string`,
  'string.empty': `"userName" cannot be an empty string`,
  'any.required': `"userName" is a required field`
});

const PASSWORD_SCHEMA = Joi.string().messages({
  'string.base': `"password" must be a string`,
  'string.empty': `"password" cannot be an empty string`,
  'any.required': `"password" is a required field`
});

const VALIDATE_CREATE_USER_SCHEMA = Joi.object({
  email: EMAIL_SCHEMA.required(),
  userName: USERNAME_SCHEMA.required(),
  password: PASSWORD_SCHEMA.required()
});

const VALIDATE_CHANGE_USER_PASSWORD_SCHEMA = Joi.object({
  userName: USERNAME_SCHEMA.required(),
  password: PASSWORD_SCHEMA.required(),
  resetCode: Joi.number(),
});

module.exports = {
  VALIDATE_CREATE_USER_SCHEMA,
  VALIDATE_CHANGE_USER_PASSWORD_SCHEMA,
  EMAIL_SCHEMA,
  USERNAME_SCHEMA,
  PASSWORD_SCHEMA
}