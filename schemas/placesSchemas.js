const Joi = require('joi');

const INDIVIDUAL_RATINGS_SCHEMA = Joi.number().greater(0).less(6);
const WORDS_SCHEMA = Joi.string();

const PLACE_ID_SCHEMA = Joi.string();
const PLACE_NAME_SCHEMA = Joi.string();

const VALIDATE_CREATE_PLACE_SCHEMA = Joi.object({
  placeName: PLACE_NAME_SCHEMA.required(),
  beers: INDIVIDUAL_RATINGS_SCHEMA,
  benny: INDIVIDUAL_RATINGS_SCHEMA,
  bloody: INDIVIDUAL_RATINGS_SCHEMA,
  burger: INDIVIDUAL_RATINGS_SCHEMA,
  words: WORDS_SCHEMA,
});

module.exports = {
  PLACE_ID_SCHEMA,
  PLACE_NAME_SCHEMA,
  INDIVIDUAL_RATINGS_SCHEMA,
  WORDS_SCHEMA,
  VALIDATE_CREATE_PLACE_SCHEMA,
}