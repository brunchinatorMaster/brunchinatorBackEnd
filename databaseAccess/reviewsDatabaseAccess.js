const reviews = require('../mockDataBase/reviews');
const { 
  docClient,
  PutCommand,
  QueryCommand,
} = require('../aws/awsClients');

/**
 * returns all reviews
 * 
 * @returns {object[]}
 */
const getReviews = async () => {
  const mockReviews = JSON.parse(JSON.stringify(reviews));
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
  const mockReviews = JSON.parse(JSON.stringify(reviews));
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
  const mockReviews = JSON.parse(JSON.stringify(reviews));
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
  const mockReviews = JSON.parse(JSON.stringify(reviews));
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
  const mockReviews = JSON.parse(JSON.stringify(reviews));
  return mockReviews.filter((review) => review.reviewId !== reviewId);
}

/**
 * adds review and returns {
 *  success: true
 * }
 * 
 * @param {object} review 
 * @returns {object[]}
 */
const addReview = async (review) => {
  const toPut = new PutCommand({
    TableName: 'Reviews',
    Item: review 
  });
  await docClient.send(toPut);
  return {
    success: true,
  };
}

module.exports = {
  getReviews,
  getReviewByReviewId,
  getReviewsByPlaceId,
  getReviewsByUserName,
  deleteReviewByReviewId,
  addReview
}
