const Joi = require('joi');
const {
  PLACE_ID_SCHEMA,
  PLACE_NAME_SCHEMA,
  INDIVIDUAL_RATINGS_SCHEMA,
  WORDS_SCHEMA,
} = require('./placesSchemas');
const { USERNAME_SCHEMA } = require('./usersSchemas');

const REVIEW_ID_SCHEMA = Joi.string();
const REVIEW_DATE_SCHEMA = Joi.date();

const VALIDATE_CREATE_REVIEW_SCHEMA = Joi.object({
  reviewId: REVIEW_ID_SCHEMA,
  placeId: PLACE_ID_SCHEMA.required(),
  userName: USERNAME_SCHEMA.required(),
  placeName: PLACE_NAME_SCHEMA.required(),
  beers: INDIVIDUAL_RATINGS_SCHEMA,
  benny: INDIVIDUAL_RATINGS_SCHEMA,
  bloody: INDIVIDUAL_RATINGS_SCHEMA,
  burger: INDIVIDUAL_RATINGS_SCHEMA,
  words: WORDS_SCHEMA,
  reviewDate: REVIEW_DATE_SCHEMA.required(),
});


module.exports = {
  REVIEW_ID_SCHEMA,
  VALIDATE_CREATE_REVIEW_SCHEMA
}