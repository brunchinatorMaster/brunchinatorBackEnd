/**
 * creates and returns a new place created from 
 * the data in a first time review, 
 * 
 * @param {object} review 
 * @returns {object}
 */
const createNewPlaceFromReview = (review) => {
  const place = {};
  place.placeName = review.placeName;
  place.beers = review.beers;
  place.benny = review.benny;
  place.burger = review.burger;
  place.bloody = review.bloody;
  place.numberOfReviews = 1;
  place.overallRating = findAverageOf([place.beers, place.benny, place.burger, place.bloody]);
  return place;
};

/**
 * returns the average of an array of numbers, 
 * 
 * @param {array} arrayOfValues 
 * @returns {object}
 */
const findAverageOf = (arrayOfValues) => {
  let numerator = 0;
  let denominator = 0;
  arrayOfValues.forEach((value) => {
    if (value) {
      numerator = numerator + value;
      denominator++;
    }
  });
  
  return +(numerator / denominator).toFixed(2);
}

/**
 * recalculates the individual ratings and overallRating
 * of a place(toUpdate) that already exists when a review is added.
 * returns toUpdate with the updated values
 * 
 * @param {object} review 
 * @param {object} toUpdate 
 * @returns {object}
 */
const recalculateRatingsForAddingReviewToPlace = (review, toUpdate) => {
  const newBeers = findAverageOf([review.beers, toUpdate.beers]);
  const newBenny = findAverageOf([review.benny, toUpdate.benny]);
  const newBloody = findAverageOf([review.bloody, toUpdate.bloody]);
  const newBurger = findAverageOf([review.burger, toUpdate.burger]);
  const newOverallRating = findAverageOf([newBeers, newBenny, newBloody, newBurger]);

  toUpdate.beers = newBeers;
  toUpdate.benny = newBenny;
  toUpdate.bloody = newBloody;
  toUpdate.burger = newBurger;
  toUpdate.overallRating = newOverallRating;
  
  return toUpdate;
};

/**
 * recalculates the individual ratings and overallRating
 * of a place(toUpdate) that already exists when a review is deleted.
 * returns toUpdate with the updated values
 * 
 * @param {object} review 
 * @param {object} toUpdate 
 * @returns {object}
 */
const recalculateRatingsForRemovingReviewFromPlace = (review, toUpdate) => {
  const newBeers = removeFromAverage(review.beers, toUpdate.beers, toUpdate.numberOfReviews);
  const newBenny = removeFromAverage(review.benny, toUpdate.benny, toUpdate.numberOfReviews);
  const newBloody = removeFromAverage(review.bloody, toUpdate.bloody, toUpdate.numberOfReviews);
  const newBurger = removeFromAverage(review.burger, toUpdate.burger, toUpdate.numberOfReviews);
  const newOverallRating = findAverageOf([newBeers, newBenny, newBloody, newBurger]);

  toUpdate.beers = newBeers;
  toUpdate.benny = newBenny;
  toUpdate.bloody = newBloody;
  toUpdate.burger = newBurger;
  toUpdate.overallRating = newOverallRating;
  
  return toUpdate;
}

/**
 * removes elementToRemove from originalAverage and returns new average
 * 
 * @param {number} elementToRemove 
 * @param {number} originalAverage 
 * @param {number} originalNumberOfElements 
 * @returns {object}
 */
const removeFromAverage = (elementToRemove, originalAverage, originalNumberOfElements) => {
  if (elementToRemove == null) {
    return originalAverage;
  }
  const numerator = (originalAverage * originalNumberOfElements) - elementToRemove;
  const denominator = originalNumberOfElements - 1;
  return +(numerator /  denominator).toFixed(2);
};

module.exports = {
  findAverageOf,
  createNewPlaceFromReview,
  recalculateRatingsForAddingReviewToPlace,
  recalculateRatingsForRemovingReviewFromPlace,
  removeFromAverage
}