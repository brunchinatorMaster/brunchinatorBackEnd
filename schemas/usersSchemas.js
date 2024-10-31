const Joi = require('joi');

const EMAIL_SCHEMA = Joi.string().email();
const USER_ID_SCHEMA = Joi.string();
const USERNAME_SCHEMA = Joi.string();
const PASSWORD_SCHEMA = Joi.string();

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