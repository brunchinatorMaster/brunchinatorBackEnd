
/**
 * creates and returns a new place created from 
 * the data in a first time review, 
 * 
 * @param {object} review 
 * @returns {object}
 */
const createNewPlaceFromReview = (review) => {
  const place = {};
  place.placeId = review.placeId;
  place.placeName = review.placeName;
  place.vicinity = review.vicinity;
  place.burger = review.burger;
  place.bloody = review.bloody;
  place.numberOfReviews = 1;
  place.overallRating = findAverageOf([place.burger, place.bloody]);
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
 * of a place that already exists when a review is added.
 * returns toUpdate with the updated values
 * 
 * @param {object} review 
 * @param {object} toUpdate 
 * @returns {object}
 */
const recalculateRatingsForAddingReviewToPlace = (review, toUpdate) => {
  const newBloody = addToAverage(toUpdate.bloody, toUpdate.numberOfReviews, review.bloody);
  const newBurger = addToAverage(toUpdate.burger, toUpdate.numberOfReviews, review.burger);
  const newOverallRating = findAverageOf([newBloody, newBurger]);

  toUpdate.bloody = newBloody;
  toUpdate.burger = newBurger;
  toUpdate.overallRating = newOverallRating;
  
  return toUpdate;
};

/**
 * adds elementToAdd to originalAverage and returns new average
 * 
 * @param {number} elementToRemove 
 * @param {number} originalAverage 
 * @param {number} originalNumberOfElements 
 * @returns {number}
 */
const addToAverage = (originalAverage, originalNumberOfElements, elementToAdd) => {
  if (!originalAverage || !originalNumberOfElements || !elementToAdd || typeof originalAverage !== 'number'|| typeof originalNumberOfElements !== 'number'|| typeof elementToAdd !== 'number' ) {
    return originalAverage;
  }
  
  const numerator = (originalAverage * originalNumberOfElements) + elementToAdd;
  const denominator = originalNumberOfElements + 1;
  return numerator / denominator;
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
  const newBloody = removeFromAverage(review.bloody, toUpdate.bloody, toUpdate.numberOfReviews);
  const newBurger = removeFromAverage(review.burger, toUpdate.burger, toUpdate.numberOfReviews);
  const newOverallRating = findAverageOf([newBloody, newBurger]);

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
 * @returns {number}
 */
const removeFromAverage = (elementToRemove, originalAverage, originalNumberOfElements) => {
  if (elementToRemove == null) {
    return originalAverage;
  }
  const numerator = (originalAverage * originalNumberOfElements) - elementToRemove;
  const denominator = originalNumberOfElements - 1;
  return +(numerator /  denominator).toFixed(2);
};

const updateAverage = (originalAverage, numberOfReviews, valueBeingRemoved, valueBeingAdded) => {
  if (!originalAverage || !numberOfReviews || !valueBeingRemoved || !valueBeingAdded || typeof originalAverage !== 'number'|| typeof numberOfReviews !== 'number'|| typeof valueBeingRemoved !== 'number' || typeof valueBeingAdded !== 'number' ) {
    return originalAverage;
  }

  const numerator = (originalAverage * numberOfReviews) - valueBeingRemoved + valueBeingAdded;
  const denominator = numberOfReviews;
  return +(numerator /  denominator).toFixed(2);
}

/**
 * recalculates the individual ratings and overallRating
 * of a place when a review is updated.
 * returns place with the updated values
 * 
 * @param {object} oldReview
 * @param {object} newReview 
 * @param {object} toUpdate 
 * @returns {object}
 */
const recalculateRatingsForUpdatingReviewOnPlace = (oldReview, newReview, toUpdate) => {
  const newBloody = updateAverage(toUpdate.bloody, toUpdate.numberOfReviews, oldReview.bloody, newReview.bloody);
  const newBurger = updateAverage(toUpdate.burger, toUpdate.numberOfReviews, oldReview.burger, newReview.burger);
  const newOverallRating = findAverageOf([newBloody, newBurger]);

  toUpdate.bloody = newBloody;
  toUpdate.burger = newBurger;
  toUpdate.overallRating = newOverallRating;
  
  return toUpdate;
};

module.exports = {
  findAverageOf,
  createNewPlaceFromReview,
  recalculateRatingsForAddingReviewToPlace,
  recalculateRatingsForRemovingReviewFromPlace,
  recalculateRatingsForUpdatingReviewOnPlace,
  removeFromAverage
}