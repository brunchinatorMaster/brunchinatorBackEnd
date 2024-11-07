const Joi = require('joi');

const EMAIL_SCHEMA = Joi.string().email();
const USER_ID_SCHEMA = Joi.string();
const USERNAME_SCHEMA = Joi.string().messages({
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

module.exports = {
  VALIDATE_CREATE_USER_SCHEMA,
  EMAIL_SCHEMA,
  USERNAME_SCHEMA,
  PASSWORD_SCHEMA,
  USER_ID_SCHEMA
}