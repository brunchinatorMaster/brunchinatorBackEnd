const {
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
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA, VALIDATE_UPDATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { USERNAME_SCHEMA } = require('../schemas/usersSchemas');
const { v4 } = require('uuid');

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
	 * and returns either {
	 * 	placesResponse: {
	 * 			addPlaceResponse: {
	 * 				success: true
	 * 			}		
	 * 		},
	 * 		addReviewResponse: {
	 * 			success: true
	 * 		}
	 * 	}
	 * OR
	 * 	{
	 * 		placesResponse: {
	 * 			updatePlaceResponse: {
	 * 				success: true,
	 * 				updatedPlace: PLACE OBJECT,
	 * 			}
	 * 		},
	 * 		addReviewResponse: {
	 * 			success: true
	 * 		}
	 * 	}
	 * 	
	 * 
	 * @param {object} review 
	 * @returns {object}
	 */
	async addReview(review) {
		const validateResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const { placeExists, place } = await getPlaceByPlaceId(review.placeId);
		let placeResponse;
		if (!placeExists) {
			placeResponse = await this.#addPlaceFromReview(review)
		} else {
			placeResponse =  await this.#updatePlaceFromReview(review, place);
		}

		review.reviewId = v4();
		const addReviewResponse = await addReview(review);

		return {
			placeResponse,
			addReviewResponse
		}
		
	}

	/**
	 * creates new place from values from review, 
	 * adds place to database,
	 * adds review to database,
	 * and returns {
	 * 	addPlaceResponse: {
	 * 		success: true
	 * 	}
	 * }
	 * 
	 * @param {object} review 
	 * @returns {object}
	 */
	async #addPlaceFromReview(review) {
		const place = createNewPlaceFromReview(review);
		const validateResponse = validateBySchema(place, VALIDATE_CREATE_PLACE_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		place.placeId = v4();
		const addPlaceResponse = await addPlace(place);

		return {
			addPlaceResponse,
		};
	}

	/**
	 * updates preexisting place with values from review
	 * and returns an object containing all reviews and all places
	 * returns {
	 *		updatePlaceResponse: {
	 *  		success: boolean,
   *  		updatedPlace: object
	 * 		},
	 * }
	 * 
	 * @param {object} review 
	 * @returns  {object}
	 */
	async #updatePlaceFromReview(review, place) { console.log('updatePlaceFromReview fires');
		let toUpdate = recalculateRatingsForAddingReviewToPlace(review, place);
		toUpdate.numberOfReviews++; 

		const validateResponse = validateBySchema(toUpdate, VALIDATE_UPDATE_PLACE_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const updatePlaceResponse = await updatePlace(toUpdate);

		return {
			updatePlaceResponse,
		};
	}
}

module.exports = ReviewsHandler;
