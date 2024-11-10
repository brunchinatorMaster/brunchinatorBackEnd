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
	getReviewsByUserName,
	deleteReviewByReviewId,
	addReview,
} = require('../databaseAccess/reviewsDatabaseAccess');
const {
	addPlace,
	getPlaceByPlaceId,
	updatePlace,
	deletePlaceByPlaceId
} = require('../databaseAccess/placesDatabaseAccess');
const { SchemaError } = require('../errors/SchemaError');
const { validateBySchema } = require('../utils/utils');
const { REVIEW_ID_SCHEMA, VALIDATE_CREATE_REVIEW_SCHEMA } = require('../schemas/reviewsSchemas');
const { PLACE_ID_SCHEMA } = require('../schemas/placesSchemas');
const { USERNAME_SCHEMA } = require('../schemas/usersSchemas');

class ReviewsHandler {

	/**
	 * returns all reviews
	 * 
	 * @returns {object[]}
	 */
	async getReviews() {
		const allReviews = await getReviews();
		// TODO do business logic, if any
		return allReviews;
	}

	/**
	 * returns review that matches reviewId
	 *  
	 * @param {string} reviewId 
	 * @returns {object}
	 */
	async getReviewByReviewId(reviewId) {
		const validateResponse = validateBySchema(reviewId, REVIEW_ID_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const reviewToReturn = await getReviewByReviewId(reviewId);
		// TODO do business logic, if any
		return reviewToReturn;
	}

	/**
	 * returns all reviews for place that matches placeId
	 * 
	 * @param {string} placeId 
	 * @returns {object[]}
	 */
	async getReviewsByPlaceId(placeId) {
		const validateResponse = validateBySchema(placeId, PLACE_ID_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const reviewsToReturn = await getReviewsByPlaceId(placeId);
		// TODO do business logic, if any
		return reviewsToReturn;
	}

	/**
	 * returns reviews left by user that matches userName
	 * 
	 * @param {string} userName 
	 * @returns {object[]}
	 */
	async getReviewsByUserName(userName) {
		const validateResponse = validateBySchema(userName, USERNAME_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const reviewsToReturn = await getReviewsByUserName(userName);
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
	async deleteReviewByReviewId(reviewId) {
		const validateResponse = validateBySchema(reviewId, REVIEW_ID_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const reviewBeingDeleted = await getReviewByReviewId(reviewId);
		const placeToUpdate = await getPlaceByPlaceId(reviewBeingDeleted.placeId);
		const allReviews = await deleteReviewByReviewId(reviewId);
		let newAllPlaces = [];

		if(placeToUpdate.numberOfReviews > 1) {
			newAllPlaces = await this.#updatePlaceForRemovingReview(reviewBeingDeleted);
		} else {
			newAllPlaces = await deletePlaceByPlaceId(placeToUpdate.placeId);
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
	async #updatePlaceForRemovingReview(review) {
		let toUpdate = await getPlaceByPlaceId(review.placeId);

		toUpdate = recalculateRatingsForRemovingReviewFromPlace(review, toUpdate);
		toUpdate.numberOfReviews--;
		const allPlaces = await updatePlace(toUpdate);
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
	async addReview(review) {
		const validateResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const placeExists = await doesPlaceExist(review.placeId);
		if(!placeExists) {
			return await this.#addReviewForNewPlace(review)
		}
		return await this.#addReviewForPreexistingPlace(review);
	}

	/**
	 * creates new place from values from review, 
	 * adds place to database,
	 * and returns an object containing all reviews and all places
	 * 
	 * @param {object} review 
	 * @returns {object}
	 */
	async #addReviewForNewPlace(review) {
		const place = createNewPlaceFromReview(review);
		const newAllPlaces = await addPlace(place);
		//TO DO we have to return the new places as well as the new reviews to the frontend.
		//maybe put in one object to return. not sure yet.
		//or the front end can make another call to refresh the places when a successfull add review happens
		// maybe a boolen on teh return 'refreshPlaces' tells the front end to do that. maybe. hmm...
		const allReviews = await addReview(review);
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
	async #addReviewForPreexistingPlace(review) {
		const newAllPlaces = await this.#updatePlaceForAddingReview(review);
		const allReviews = await addReview(review);
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
	async #updatePlaceForAddingReview(review) {
		// TODO this manual finding of the place may not be necessary
		// once we have a database we may have a patch function
		// for now it is there to mimic functionality.
		let toUpdate = await getPlaceByPlaceId(review.placeId);

		toUpdate = recalculateRatingsForAddingReviewToPlace(review, toUpdate);
		toUpdate.numberOfReviews++;
		const allPlaces = await updatePlace(toUpdate);
		// TODO do business logic, if any
		return allPlaces;
	}
}

module.exports = ReviewsHandler;
