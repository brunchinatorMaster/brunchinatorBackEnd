const Joi = require('joi');
const {
  PLACE_ID_SCHEMA,
  PLACE_NAME_SCHEMA,
  RATINGS_SCHEMA,
  WORDS_SCHEMA,
} = require('./placesSchemas');
const { USERNAME_SCHEMA } = require('./usersSchemas');

const REVIEW_ID_SCHEMA = Joi.string().required().messages({
  'string.base': `"reviewId" must be a string`,
  'string.empty': `"reviewId" cannot be an empty string`,
  'any.required': `"reviewId" is a required field`
});;
const REVIEW_DATE_SCHEMA = Joi.date();

const VALIDATE_CREATE_REVIEW_SCHEMA = Joi.object({
  placeId: PLACE_ID_SCHEMA,
  userName: USERNAME_SCHEMA.required(),
  placeName: PLACE_NAME_SCHEMA.required(),
  bloody: RATINGS_SCHEMA,
  burger: RATINGS_SCHEMA,
  words: WORDS_SCHEMA,
  reviewDate: REVIEW_DATE_SCHEMA.required(),
});

const VALIDATE_UPDATE_REVIEW_SCHEMA = Joi.object({
  reviewId: REVIEW_ID_SCHEMA,
  placeId: PLACE_ID_SCHEMA,
  userName: USERNAME_SCHEMA.required(),
  placeName: PLACE_NAME_SCHEMA.required(),
  bloody: RATINGS_SCHEMA,
  burger: RATINGS_SCHEMA,
  words: WORDS_SCHEMA,
  reviewDate: REVIEW_DATE_SCHEMA.required(),
});


module.exports = {
  REVIEW_ID_SCHEMA,
  VALIDATE_CREATE_REVIEW_SCHEMA,
  VALIDATE_UPDATE_REVIEW_SCHEMA
}