const {
	doesPlaceExist,
	createNewPlaceFromReview,
	recalculateRatingsForAddingReviewToPlace,
	recalculateRatingsForRemovingReviewFromPlace
} = require('../utils/placesUtils');
const {
	getReviews,
	getReviewByReviewId,
	getReviewsByPlaceId,
	getReviewsByUserId,
	deleteReviewByReviewId,
	addReview,
} = require('../databaseAccess/reviewsDatabaseAccess');
const {
	addPlace,
	getPlaceByPlaceId,
	updatePlace,
	deletePlaceByPlaceId
} = require('../databaseAccess/placesDatabaseAccess')

class ReviewsHandler {

	/**
	 * returns all reviews
	 * 
	 * @returns {object[]}
	 */
	getReviews() {
		const allReviews = getReviews();
		// TODO do business logic, if any
		return allReviews;
	}

	/**
	 * returns review that matches reviewId
	 *  
	 * @param {string} reviewId 
	 * @returns {object}
	 */
	getReviewByReviewId(reviewId) {
		const reviewToReturn = getReviewByReviewId(reviewId);
		// TODO do business logic, if any
		return reviewToReturn;
	}

	/**
	 * returns all reviews for place that matches placeId
	 * 
	 * @param {string} placeId 
	 * @returns {object[]}
	 */
	getReviewsByPlaceId(placeId) {
		const reviewsToReturn = getReviewsByPlaceId(placeId);
		// TODO do business logic, if any
		return reviewsToReturn;
	}

	/**
	 * returns reviews left by user that matches userId
	 * 
	 * @param {string} userId 
	 * @returns {object[]}
	 */
	getReviewsByUserId(userId) {
		const reviewsToReturn = getReviewsByUserId(userId);
		// TODO do business logic, if any
		return reviewsToReturn;
	}

	/**
	 * deletes review that matches reviewId and then
	 * either deletes or updates the place the review was for
	 * 
	 * @param {string} reviewId 
	 * @returns {object}
	 */
	deleteReviewByReviewId(reviewId) {
		const reviewBeingDeleted = getReviewByReviewId(reviewId);
		const placeToUpdate = getPlaceByPlaceId(reviewBeingDeleted.placeId);
		const allReviews = deleteReviewByReviewId(reviewId);
		let newAllPlaces = [];

		if(placeToUpdate.numberOfReviews > 1) {
			newAllPlaces = this.updatePlaceForRemovingReview(reviewBeingDeleted);
		} else {
			newAllPlaces = deletePlaceByPlaceId(placeToUpdate.placeId);
		}

		const toReturn = {
			places: newAllPlaces,
			reviews: allReviews,
		}
		//TODO do business logic, if any
		return toReturn;
	}

	/**
	 * updates place when a review for that place is removed.
	 * recalculates the individual ratings,
	 * updates the numberOfReviews,
	 * and returns all places
	 * 
	 * @param {object} review 
	 * @returns 
	 */
	updatePlaceForRemovingReview(review) {
		let toUpdate = getPlaceByPlaceId(review.placeId);

		toUpdate = recalculateRatingsForRemovingReviewFromPlace(review, toUpdate);
		toUpdate.numberOfReviews--;
		const allPlaces = updatePlace(toUpdate);
		// TODO do business logic, if any
		return allPlaces;
	}

	/**
	 * adds review, 
	 * creates place or updates place that the review is for,
	 * and returns an object containing all reviews and all places
	 * 
	 * @param {object} review 
	 * @returns {object}
	 */
	addReview(review) {
		const placeExists = doesPlaceExist(review.placeId);
		if(!placeExists) {
			return this.addReviewForNewPlace(review)
		}
		return this.addReviewForPreexistingPlace(review);
	}

	/**
	 * creates new place from values from review, 
	 * adds place to database,
	 * and returns an object containing all reviews and all places
	 * 
	 * @param {object} review 
	 * @returns {object}
	 */
	addReviewForNewPlace(review) {
		const place = createNewPlaceFromReview(review);
		const newAllPlaces = addPlace(place);
		//TO DO we have to return the new places as well as the new reviews to the frontend.
		//maybe put in one object to return. not sure yet.
		//or the front end can make another call to refresh the places when a successfull add review happens
		// maybe a boolen on teh return 'refreshPlaces' tells the front end to do that. maybe. hmm...
		const allReviews = addReview(review);
		const toReturn = {
			places: newAllPlaces,
			reviews: allReviews,
		}
		return toReturn;
	}

	/**
	 * updates preexisting place with values from review
	 * and returns an object containing all reviews and all places
	 * 
	 * @param {object} review 
	 * @returns  {object}
	 */
	addReviewForPreexistingPlace(review) {
		const newAllPlaces = this.updatePlaceForAddingReview(review);
		const allReviews = addReview(review);
		const toReturn = {
			places: newAllPlaces,
			reviews: allReviews,
		}
		return toReturn;
	}

	/**
	 * gets place that matches review.placeId, 
	 * recalculates values with the values from review, 
	 * updates place in database, 
	 * and returns all places
	 * 
	 * @param {object} review 
	 * @returns {object[]}
	 */
	updatePlaceForAddingReview(review) {
		// TODO this manual finding of the place may not be necessary
		// once we have a database we may have a patch function
		// for now it is there to mimic functionality.
		let toUpdate = getPlaceByPlaceId(review.placeId);

		toUpdate = recalculateRatingsForAddingReviewToPlace(review, toUpdate);
		toUpdate.numberOfReviews++;
		const allPlaces = updatePlace(toUpdate);
		// TODO do business logic, if any
		return allPlaces;
	}
}

module.exports = ReviewsHandler;
