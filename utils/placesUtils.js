const { getAllPlaces } = require('../databaseAccess/placesDatabaseAccess');

const createNewPlaceFromReview = (review) => {
  const place = {};
  place.placeId = review.placeId;
  place.placeName = review.placeName;
  place.beers = review.beers;
  place.benny = review.benny;
  place.burger = review.burger;
  place.bloody = review.bloody;
  place.numberOfReviews = 1;
  place.overallRating = findAverageOf([place.beers, place.benny, place.burger, place.bloody]);
  return place;
};

const findAverageOf = (arrayOfValues) => {
  let numerator = 0;
  let denominator = 0;
  arrayOfValues.forEach((value) => {
    if(value) {
      numerator = numerator + value;
      denominator++;
    }
  });
  
  return +(numerator / denominator).toFixed(2);
}

const doesPlaceExist = async (placeIdToVerify) => {
  const places = await getAllPlaces();
  let toReturn = false;
  places.forEach((place) => {
    if(place.placeId == placeIdToVerify) {
      toReturn = true;
    }
  });
  return toReturn;
}

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

const removeFromAverage = (elementToRemove, originalAverage, originalNumberOfElements) => {
  if(elementToRemove == null) {
    return originalAverage;
  }
  const numerator = (originalAverage * originalNumberOfElements) - elementToRemove;
  const denominator = originalNumberOfElements - 1;
  return +(numerator /  denominator).toFixed(2);
};

module.exports = {
  findAverageOf,
  createNewPlaceFromReview,
  doesPlaceExist,
  recalculateRatingsForAddingReviewToPlace,
  recalculateRatingsForRemovingReviewFromPlace,
  removeFromAverage
}