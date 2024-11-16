const Joi = require('joi');

const RATINGS_SCHEMA = Joi.number().greater(-1).less(6);
const WORDS_SCHEMA = Joi.string();

const PLACE_ID_SCHEMA = Joi.string();
const PLACE_NAME_SCHEMA = Joi.string();

const NUMBER_OF_REVIEWS_SCHEMA = Joi.number();

const VALIDATE_CREATE_PLACE_SCHEMA = Joi.object({
  placeName: PLACE_NAME_SCHEMA.required(),
  beers: RATINGS_SCHEMA,
  benny: RATINGS_SCHEMA,
  bloody: RATINGS_SCHEMA,
  burger: RATINGS_SCHEMA,
  words: WORDS_SCHEMA,
  overallRating: RATINGS_SCHEMA,
  numberOfReviews: NUMBER_OF_REVIEWS_SCHEMA,
});
const VALIDATE_UPDATE_PLACE_SCHEMA = Joi.object({
  placeId: PLACE_ID_SCHEMA.required(),
  placeName: PLACE_NAME_SCHEMA.required(),
  beers: RATINGS_SCHEMA,
  benny: RATINGS_SCHEMA,
  bloody: RATINGS_SCHEMA,
  burger: RATINGS_SCHEMA,
  words: WORDS_SCHEMA,
  overallRating: RATINGS_SCHEMA,
  numberOfReviews: NUMBER_OF_REVIEWS_SCHEMA,
});

module.exports = {
  PLACE_ID_SCHEMA,
  PLACE_NAME_SCHEMA,
  RATINGS_SCHEMA,
  WORDS_SCHEMA,
  VALIDATE_CREATE_PLACE_SCHEMA,
  VALIDATE_UPDATE_PLACE_SCHEMA,
}