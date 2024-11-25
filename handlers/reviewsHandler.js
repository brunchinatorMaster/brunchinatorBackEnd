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
} = require('../databaseAccess/reviewsDatabaseAccess');
const {
	getPlaceByPlaceId,
	updatePlace,
	deletePlaceByPlaceId
} = require('../databaseAccess/placesDatabaseAccess');
const { validateBySchema } = require('../utils/utils');
const { REVIEW_ID_SCHEMA, VALIDATE_CREATE_REVIEW_SCHEMA } = require('../schemas/reviewsSchemas');
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA, VALIDATE_UPDATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { USERNAME_SCHEMA } = require('../schemas/usersSchemas');
const { v4 } = require('uuid');
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { transactionAddPlaceAndAddReview, transactionUpdatePlaceAndAddReview, transactionUpdatePlaceAndDeleteReview, transactionDeletePlaceAndDeleteReview } = require('../databaseAccess/transactDatabaseAccess');

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
		
		let response;
		if (placeToUpdate.numberOfReviews > 1) {
			const updatedPlace = await this.#updatePlaceForRemovingReview(reviewBeingDeleted, placeToUpdate);
			response = await transactionUpdatePlaceAndDeleteReview(updatedPlace, reviewBeingDeleted.reviewId);
		} else {
			response = await transactionDeletePlaceAndDeleteReview(placeToUpdate.placeId, placeToUpdate.placeName, reviewBeingDeleted.reviewId);
		}

		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}

		return response;
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
		const reviewIsValid = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
		if (!reviewIsValid.isValid) {
			return new BadSchemaResponse(400, reviewIsValid.error.message);
		}

		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(review.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new DBErrorResponse(getPlaceByPlaceIdResponse.DBError?.$metadata?.httpStatusCode, getPlaceByPlaceIdResponse.DBError.message);
		}
		const placeExists = getPlaceByPlaceIdResponse.success;

		let response;
		if (!placeExists) {
			response = await this.addPlaceAndAddReview(review);
		} else {
			response = await this.updatePlaceAndAddReview(getPlaceByPlaceIdResponse.place, review);
		}

		return response;
		
	}

	async addPlaceAndAddReview(review) {
		const place = createNewPlaceFromReview(review);
		const placeIsValid = validateBySchema(place, VALIDATE_CREATE_PLACE_SCHEMA);
		if (!placeIsValid.isValid) {
			return new BadSchemaResponse(400, placeIsValid.error.message);
		}
		review.reviewId = v4();
		const response = await transactionAddPlaceAndAddReview(place, review);
		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}
		return response;
	}

	async updatePlaceAndAddReview(place, review) {
		let toUpdate = recalculateRatingsForAddingReviewToPlace(review, place);
		toUpdate.numberOfReviews++; 
		
		const placeIsValid = validateBySchema(toUpdate, VALIDATE_UPDATE_PLACE_SCHEMA);
		if (!placeIsValid.isValid) {
			return new BadSchemaResponse(400, placeIsValid.error.message);
		}
		review.reviewId = v4();
		const response = await transactionUpdatePlaceAndAddReview(toUpdate, review);
		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}
		return response;
	}
}

module.exports = ReviewsHandler;
