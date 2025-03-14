
/**
 * Creates and returns a new place object from the provided review.
 *
 * This function extracts place-related properties from the review object to construct a new place.
 * It initializes the place with a single review and calculates the overall rating using the findAverageOf helper.
 *
 * @param {Object} review - The review object containing place information.
 *   Expected properties include:
 *     - placeId {string}: The unique identifier for the place.
 *     - placeName {string}: The name of the place.
 *     - vicinity {string}: The location or vicinity of the place.
 *     - burger {number}: A rating for the burger aspect.
 *     - bloody {number}: A rating for the bloody aspect.
 * @returns {Object} The new place object with the following properties:
 *   - placeId {string}
 *   - placeName {string}
 *   - vicinity {string}
 *   - burger {number}
 *   - bloody {number}
 *   - numberOfReviews {number}: Initialized to 1.
 *   - overallRating {number}: The average of burger and bloody ratings.
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
 * Calculates the average of an array of numeric values.
 *
 * This function iterates over the provided array and sums up values that are truthy (ignoring falsy values such as 0, null, or undefined).
 * It then computes the average by dividing the sum by the count of truthy values and returns the result rounded to two decimal places.
 *
 * @param {number[]} arrayOfValues - An array of numeric values.
 * @returns {number} The average of the truthy numeric values, rounded to two decimal places.
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
 * Recalculates the ratings for a place when a new review is added.
 *
 * This function updates the place's rating values by incorporating the new review's ratings.
 * It computes the new 'bloody' and 'burger' ratings using the helper function `addToAverage`, 
 * which adjusts the current average based on the existing number of reviews and the new review's rating.
 * The new overall rating is then calculated using the `findAverageOf` function, averaging the new 'bloody' 
 * and 'burger' ratings. The updated ratings are assigned back to the place object, which is then returned.
 *
 * @param {Object} review - The new review object containing rating properties.
 *   Expected properties include:
 *     - bloody {number}: The new review's bloody rating.
 *     - burger {number}: The new review's burger rating.
 * @param {Object} toUpdate - The place object to update.
 *   Expected properties include:
 *     - bloody {number}: The current average bloody rating.
 *     - burger {number}: The current average burger rating.
 *     - numberOfReviews {number}: The current number of reviews.
 * @returns {Object} The updated place object with recalculated ratings:
 *   - bloody {number}: The new average bloody rating.
 *   - burger {number}: The new average burger rating.
 *   - overallRating {number}: The new overall rating calculated from the updated bloody and burger ratings.
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
 * Calculates a new average by adding a new element to an existing average.
 *
 * This function computes the new average when a new element is added to a set of numbers.
 * It multiplies the original average by the original number of elements, adds the new element,
 * and then divides by the new total number of elements. If any of the inputs are missing or
 * not numbers, or if any of the values are falsy, it returns the original average without modification.
 *
 * @param {number} originalAverage - The current average value.
 * @param {number} originalNumberOfElements - The count of elements included in the original average.
 * @param {number} elementToAdd - The new element to add to the average calculation.
 * @returns {number} The new average after adding the element.
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
 * Recalculates the ratings for a place when a review is removed.
 *
 * This function updates the place's rating values by removing the contribution of the specified review.
 * It computes the new 'bloody' and 'burger' ratings using the helper function `removeFromAverage`,
 * which adjusts the current average based on the current number of reviews and the rating being removed.
 * The new overall rating is then calculated using the `findAverageOf` function, averaging the new 'bloody'
 * and 'burger' ratings. The updated ratings are assigned back to the place object, which is then returned.
 *
 * @param {Object} review - The review object containing the ratings to be removed.
 *   Expected properties include:
 *     - bloody {number}: The review's bloody rating.
 *     - burger {number}: The review's burger rating.
 * @param {Object} toUpdate - The place object to update.
 *   Expected properties include:
 *     - bloody {number}: The current average bloody rating.
 *     - burger {number}: The current average burger rating.
 *     - numberOfReviews {number}: The current number of reviews.
 * @returns {Object} The updated place object with recalculated ratings:
 *   - bloody {number}: The new average bloody rating.
 *   - burger {number}: The new average burger rating.
 *   - overallRating {number}: The new overall rating calculated from the updated bloody and burger ratings.
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
 * Calculates a new average after removing an element from an existing average.
 *
 * This function computes the new average by subtracting the specified element from the total sum
 * (computed as originalAverage multiplied by originalNumberOfElements) and then dividing by the new number of elements.
 * The result is rounded to two decimal places. If the element to remove is null or undefined, the original average is returned.
 *
 * @param {number} elementToRemove - The element value to remove from the average.
 * @param {number} originalAverage - The current average value before removal.
 * @param {number} originalNumberOfElements - The current number of elements included in the original average.
 * @returns {number} The new average after removing the element, rounded to two decimal places.
 */
const removeFromAverage = (elementToRemove, originalAverage, originalNumberOfElements) => {
  if (elementToRemove == null) {
    return originalAverage;
  }
  const numerator = (originalAverage * originalNumberOfElements) - elementToRemove;
  const denominator = originalNumberOfElements - 1;
  return +(numerator /  denominator).toFixed(2);
};

/**
 * Updates an average by removing one value and adding another.
 *
 * This function calculates a new average by subtracting the value being removed from the total sum (computed as the original average multiplied by the number of reviews)
 * and then adding the new value. The result is divided by the original number of reviews and rounded to two decimal places.
 * If any of the inputs are missing, falsy, or not numbers, the original average is returned.
 *
 * @param {number} originalAverage - The current average value.
 * @param {number} numberOfReviews - The number of reviews included in the original average.
 * @param {number} valueBeingRemoved - The value to subtract from the current total.
 * @param {number} valueBeingAdded - The value to add to the current total.
 * @returns {number} The updated average after removing the old value and adding the new value, rounded to two decimal places.
 */
const updateAverage = (originalAverage, numberOfReviews, valueBeingRemoved, valueBeingAdded) => {
  if (!originalAverage || !numberOfReviews || !valueBeingRemoved || !valueBeingAdded || typeof originalAverage !== 'number'|| typeof numberOfReviews !== 'number'|| typeof valueBeingRemoved !== 'number' || typeof valueBeingAdded !== 'number' ) {
    return originalAverage;
  }

  const numerator = (originalAverage * numberOfReviews) - valueBeingRemoved + valueBeingAdded;
  const denominator = numberOfReviews;
  return +(numerator /  denominator).toFixed(2);
}

/**
 * Recalculates the ratings for a place when an existing review is updated.
 *
 * This function adjusts the current ratings of a place by replacing the contribution of an old review with the values of a new review.
 * It uses the helper function `updateAverage` to recalculate the individual ratings (bloody and burger) based on the old and new values,
 * while keeping the total number of reviews constant. The overall rating is then recalculated by taking the average of the updated bloody and burger ratings.
 * The updated values are assigned back to the place object, which is returned.
 *
 * @param {Object} oldReview - The previous review object containing the original ratings.
 *   Expected properties include:
 *     - bloody {number}: The original bloody rating.
 *     - burger {number}: The original burger rating.
 * @param {Object} newReview - The updated review object containing the new ratings.
 *   Expected properties include:
 *     - bloody {number}: The new bloody rating.
 *     - burger {number}: The new burger rating.
 * @param {Object} toUpdate - The place object to update.
 *   Expected properties include:
 *     - bloody {number}: The current average bloody rating.
 *     - burger {number}: The current average burger rating.
 *     - numberOfReviews {number}: The total number of reviews for the place.
 * @returns {Object} The updated place object with recalculated ratings:
 *   - bloody {number}: The new average bloody rating.
 *   - burger {number}: The new average burger rating.
 *   - overallRating {number}: The new overall rating calculated from the updated bloody and burger ratings.
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