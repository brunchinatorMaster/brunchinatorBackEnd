const reviews = require('../mockDataBase/reviews');
const { 
  docClient,
  PutCommand,
  QueryCommand,
} = require('../aws/awsClients');
const { deepCopy } = require('../utils/utils');

/**
 * returns all reviews
 * 
 * @returns {object[]}
 */
const getReviews = async () => {
  const mockReviews = deepCopy(reviews);
  return mockReviews;
}

/**
 * returns review that matches reviewId
 * 
 * @param {string} reviewId 
 * @returns {object}
 */
const getReviewByReviewId = async (reviewId) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one place by id, or some filtering of allPlaces
  const mockReviews = deepCopy(reviews);
  return mockReviews.filter((review) => review.reviewId == reviewId)?.[0] ?? null;
}

/**
 * returns all reviews that are for place that matches placeId
 * 
 * @param {string} placeId 
 * @returns {object[]}
 */
const getReviewsByPlaceId = async (placeId) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one place by id, or some filtering of allPlaces
  const mockReviews = deepCopy(reviews);
  return mockReviews.filter((review) => review.placeId == placeId) ?? [];
}

/**
 * returns all reviews for user that matches userName
 * 
 * @param {string} userName 
 * @returns {object[]}
 */
const getReviewsByUserName = async (userName) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one place by id, or some filtering of allPlaces
  const mockReviews = deepCopy(reviews);
  return mockReviews.filter((review) => review.userName == userName) ?? [];
}

/**
 * deletes review that matches reviewId and returns all remaining reviews
 * 
 * @param {string} reviewId 
 * @returns {object[]}
 */
const deleteReviewByReviewId = async (reviewId) => {
  // TODO this will be replaced with a delete call to the database
  const mockReviews = deepCopy(reviews);
  return mockReviews.filter((review) => review.reviewId !== reviewId);
}

/**
 * adds review to dynamo
 * returns {
 *  success: boolean,
 *  DBError:error || null
 * }
 * @param {object} user 
 * @returns {object}
 */
const addReview = async (review) => {
  const toPut = new PutCommand({
    TableName: 'Reviews',
    Item: review 
  });

  let success = false;
  let DBError;
  try {
    const response = await docClient.send(toPut);
    if (!response?.ValidationException) {
      success = true;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      DBError
    }
  }
}

module.exports = {
  getReviews,
  getReviewByReviewId,
  getReviewsByPlaceId,
  getReviewsByUserName,
  deleteReviewByReviewId,
  addReview
}
