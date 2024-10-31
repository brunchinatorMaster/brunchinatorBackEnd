const reviews = require('../mockDataBase/reviews');

/**
 * returns all reviews
 * 
 * @returns {object[]}
 */
const getReviews = () => {
  const mockReviews = JSON.parse(JSON.stringify(reviews));
  return mockReviews;
}

/**
 * returns review that matches reviewId
 * 
 * @param {string} reviewId 
 * @returns {object}
 */
const getReviewByReviewId = (reviewId) => {
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
const getReviewsByPlaceId = (placeId) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one place by id, or some filtering of allPlaces
  const mockReviews = JSON.parse(JSON.stringify(reviews));
  return mockReviews.filter((review) => review.placeId == placeId) ?? [];
}

/**
 * returns all reviews for user that matches userId
 * 
 * @param {string} userId 
 * @returns {object[]}
 */
const getReviewsByUserId = (userId) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one place by id, or some filtering of allPlaces
  const mockReviews = JSON.parse(JSON.stringify(reviews));
  return mockReviews.filter((review) => review.userId == userId) ?? [];
}

/**
 * deletes review that matches reviewId and returns all remaining reviews
 * 
 * @param {string} reviewId 
 * @returns {object[]}
 */
const deleteReviewByReviewId = (reviewId) => {
  // TODO this will be replaced with a delete call to the database
  const mockReviews = JSON.parse(JSON.stringify(reviews));
  return mockReviews.filter((review) => review.reviewId !== reviewId);
}

/**
 * adds review and returns all reviews
 * 
 * @param {object} review 
 * @returns {object[]}
 */
const addReview = (review) => {
  // TODO this will be replaced with a add call to the database
  const mockReviews = JSON.parse(JSON.stringify(reviews));
  mockReviews.push(review);
  return mockReviews;
}

module.exports = {
  getReviews,
  getReviewByReviewId,
  getReviewsByPlaceId,
  getReviewsByUserId,
  deleteReviewByReviewId,
  addReview
}
