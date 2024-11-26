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
	 * finds all reviews
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	reviews: [REVIEW] || null
	 * }
	 * 
	 * @returns {object[]}
	 */
	async getReviews() {
		const response = await getReviews();
		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		return {
			success: true,
			reviews: response.reviews
		}
	}

	/**
	 * finds review that matches reviewId
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	reviewExists: boolean,
	 * 	review: REVIEW
	 * }
	 *  
	 * @param {string} reviewId 
	 * @returns {object}
	 */
	async getReviewByReviewId(reviewId) {
		const reviewIdSchemaResponse = validateBySchema(reviewId, REVIEW_ID_SCHEMA);
		if (!reviewIdSchemaResponse.isValid) {
			return new BadSchemaResponse(reviewIdSchemaResponse);
		}

		const response = await getReviewByReviewId(reviewId);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		return {
			success: true,
			reviewExists: response.success,
			review: response.review,
		}
	}

	/**
	 * finds all reviews for place that matches placeId
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	reviewsExists: boolean,
	 * 	reviews: [REVIEW]
	 * }
	 * 
	 * @param {string} placeId 
	 * @returns {object[]}
	 */
	async getReviewsByPlaceId(placeId) {
		const placeIdSchemaResponse= validateBySchema(placeId, PLACE_ID_SCHEMA);
		if (!placeIdSchemaResponse.isValid) {
			return new BadSchemaResponse(placeIdSchemaResponse);
		}

		const response = await getReviewsByPlaceId(placeId);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		return {
			success: true,
			reviewsExist: response.success,
			reviews: response.reviews,
		}
	}

	/**
	 * finds reviews left by user that matches userName
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	reviewsExists: boolean,
	 * 	reviews: [REVIEW]
	 * }
	 * 
	 * @param {string} userName 
	 * @returns {object[]}
	 */
	async getReviewsByUserName(userName) {
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		const response = await getReviewsByUserName(userName);
		
		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
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
	 * returns {
	 * 	success: boolean,
	 * 	DBError: ERROR || null
	 * }
	 * 
	 * @param {string} reviewId 
	 * @returns {object}
	 */
	async deleteReviewByReviewId(reviewId) {
		const reviewIdSchemaResponse = validateBySchema(reviewId, REVIEW_ID_SCHEMA);
		if (!reviewIdSchemaResponse.isValid) {
			return new BadSchemaResponse(reviewIdSchemaResponse);
		}
		
		const getReviewByReviewIdResponse = await getReviewByReviewId(reviewId);
		if (getReviewByReviewIdResponse.DBError) {
			return new DBErrorResponse(getReviewByReviewIdResponse.DBError);
		}
		
		const reviewBeingDeleted = getReviewByReviewIdResponse.review;

		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(reviewBeingDeleted.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new DBErrorResponse(getPlaceByPlaceIdResponse.DBError);
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
			return new DBErrorResponse(response.DBError);
		}

		return response;
	}

	/**
	 * updates place when a review for that place is removed.
	 * recalculates the individual ratings,
	 * updates the numberOfReviews,
	 * 
	 * returns PLACE
	 * 
	 * @param {object} review
	 * @param {object} placeToUpdate 
	 * @returns  {object}
	 */
	async #updatePlaceForRemovingReview(review, placeToUpdate) {
		placeToUpdate = recalculateRatingsForRemovingReviewFromPlace(review, placeToUpdate);
		placeToUpdate.numberOfReviews--;
		return placeToUpdate;
	}

	/**
	 * adds review, 
	 * creates place or updates place that the review is for,
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	DBError: ERROR || null
	 * }
	 * 
	 * @param {object} review 
	 * @returns {object}
	 */
	async addReview(review) {
		const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
		if (!reviewSchemaResponse.isValid) {
			return new BadSchemaResponse(reviewSchemaResponse);
		}

		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(review.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new DBErrorResponse(getPlaceByPlaceIdResponse.DBError);
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

	/**
	 * adds place and adds review
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	DBError: ERROR || null
	 * }
	 * 
	 * @param {object} review 
	 * @returns {object}
	 */
	async addPlaceAndAddReview(review) {
		const place = createNewPlaceFromReview(review);
		const placeSchemaResponse = validateBySchema(place, VALIDATE_CREATE_PLACE_SCHEMA);
		if (!placeSchemaResponse.isValid) {
			return new BadSchemaResponse(placeSchemaResponse);
		}
		review.reviewId = v4();
		const response = await transactionAddPlaceAndAddReview(place, review);
		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}
		return response;
	}

	/**
	 * updates place and adds review
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	DBError: ERROR || null
	 * }
	 * 
	 * @param {object} place 
	 * @param {object} review 
	 * @returns {object}
	 */
	async updatePlaceAndAddReview(place, review) {
		let toUpdate = recalculateRatingsForAddingReviewToPlace(review, place);
		toUpdate.numberOfReviews++; 
		
		const placeSchemaResponse = validateBySchema(toUpdate, VALIDATE_UPDATE_PLACE_SCHEMA);
		if (!placeSchemaResponse.isValid) {
			return new BadSchemaResponse(placeSchemaResponse);
		}
		review.reviewId = v4();
		const response = await transactionUpdatePlaceAndAddReview(toUpdate, review);
		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}
		return response;
	}
}

module.exports = ReviewsHandler;
