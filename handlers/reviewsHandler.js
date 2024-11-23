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
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');

class ReviewsHandler {

	/**
	 * returns all reviews
	 * 
	 * @returns {object[]}
	 */
	async getReviews() {
		const response = await getReviews();
		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}

		return {
			success: true,
			reviews: response.reviews
		}
	}

	/**
	 * returns review that matches reviewId
	 *  
	 * @param {string} reviewId 
	 * @returns {object}
	 */
	async getReviewByReviewId(reviewId) {
		const reviewIdIsValid = validateBySchema(reviewId, REVIEW_ID_SCHEMA);
		if (!reviewIdIsValid.isValid) {
			return new BadSchemaResponse(400, reviewIdIsValid.error.message);
		}

		const response = await getReviewByReviewId(reviewId);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}

		return {
			success: true,
			reviewExists: response.success,
			review: response.review,
		}
	}

	/**
	 * returns all reviews for place that matches placeId
	 * 
	 * @param {string} placeId 
	 * @returns {object[]}
	 */
	async getReviewsByPlaceId(placeId) {
		const placeIdIsValid = validateBySchema(placeId, PLACE_ID_SCHEMA);

		if (!placeIdIsValid.isValid) {
			return new BadSchemaResponse(400, placeIdIsValid.error.message);
		}

		const response = await getReviewsByPlaceId(placeId);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}

		return {
			success: true,
			reviewsExist: response.success,
			reviews: response.reviews,
		}
	}

	/**
	 * returns reviews left by user that matches userName
	 * 
	 * @param {string} userName 
	 * @returns {object[]}
	 */
	async getReviewsByUserName(userName) {
		const usernameIsValid = validateBySchema(userName, USERNAME_SCHEMA);

		if (!usernameIsValid.isValid) {
			return new BadSchemaResponse(400, usernameIsValid.error.message);
		}

		const response = await getReviewsByUserName(userName);
		
		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}

		return {
			success: true,
			reviewsExist: response.success,
			reviews: response.reviews,
		}
	}

	/**
	 * deletes review that matches reviewId and then
	 * either deletes or updates the place the review was for
	 * 
	 * @param {string} reviewId 
	 * @returns {object}
	 */
	async deleteReviewByReviewId(reviewId) {
		const reviewIdIsValid = validateBySchema(reviewId, REVIEW_ID_SCHEMA);
		if (!reviewIdIsValid.isValid) {
			return new BadSchemaResponse(400, reviewIdIsValid.error.message);
		}

		const getReviewByReviewIdResponse = await getReviewByReviewId(reviewId);
		if (getReviewByReviewIdResponse.DBError) {
			return new DBErrorResponse(getReviewByReviewIdResponse.DBError?.$metadata?.httpStatusCode, getReviewByReviewIdResponse.DBError.message);
		}

		const reviewBeingDeleted = getReviewByReviewIdResponse.review;

		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(reviewBeingDeleted.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new DBErrorResponse(getPlaceByPlaceIdResponse.DBError?.$metadata?.httpStatusCode, getPlaceByPlaceIdResponse.DBError.message);
		}
		const placeToUpdate = getPlaceByPlaceIdResponse.place;
		
		const deleteReviewByReviewIdResponse = await deleteReviewByReviewId(reviewId);
		if (deleteReviewByReviewIdResponse.DBError) {
			return new DBErrorResponse(deleteReviewByReviewIdResponse.DBError?.$metadata?.httpStatusCode, deleteReviewByReviewIdResponse.DBError.message);
		}

		if (placeToUpdate.numberOfReviews > 1) {
			const updatedPlace = await this.#updatePlaceForRemovingReview(reviewBeingDeleted, placeToUpdate);
			const updatePlaceResponse = await updatePlace(updatedPlace);
			if (updatePlaceResponse.DBError) {
				return new DBErrorResponse(updatePlaceResponse.DBError?.$metadata?.httpStatusCode, updatePlaceResponse.DBError.message);
			}
		} else {
			const deletePlaceByPlaceIdResponse = await deletePlaceByPlaceId(placeToUpdate.placeId);
			if (deletePlaceByPlaceIdResponse.DBError) {
				return new DBErrorResponse(deletePlaceByPlaceIdResponse.DBError?.$metadata?.httpStatusCode, deletePlaceByPlaceIdResponse.DBError.message);
			}
		}

		return {
			success: true
		}
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
	async #updatePlaceForRemovingReview(review, placeToUpdate) {
		placeToUpdate = recalculateRatingsForRemovingReviewFromPlace(review, placeToUpdate);
		placeToUpdate.numberOfReviews--;
		return placeToUpdate;
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

		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(review.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new DBErrorResponse(getPlaceByPlaceIdResponse.DBError?.$metadata?.httpStatusCode, getPlaceByPlaceIdResponse.DBError.message);
		}
		const placeExists = getPlaceByPlaceIdResponse.success;

		let placeResponse;
		if (!placeExists) {
			placeResponse = await this.#addPlaceFromReview(review)
		} else {
			placeResponse =  await this.#updatePlaceFromReview(review, getPlaceByPlaceIdResponse.place);
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
	async #updatePlaceFromReview(review, place) {
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
