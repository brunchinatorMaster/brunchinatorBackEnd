const Joi = require('joi');

const PLACE_ID_SCHEMA = Joi.string();
const PLACE_NAME_SCHEMA = Joi.string();

module.exports = {
  PLACE_ID_SCHEMA,
  PLACE_NAME_SCHEMA
}