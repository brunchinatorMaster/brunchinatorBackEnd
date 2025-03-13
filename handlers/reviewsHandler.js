const {
	createNewPlaceFromReview,
	recalculateRatingsForAddingReviewToPlace,
	recalculateRatingsForRemovingReviewFromPlace,
	recalculateRatingsForUpdatingReviewOnPlace
} = require('../utils/placesUtils');
const {
	getReviews,
	getReviewByReviewId,
	getReviewsByPlaceId,
	getReviewsByUserName,
} = require('../databaseAccess/reviewsDatabaseAccess');
const { getImagesCountForReview, createFolder, uploadReviewImages } = require('../s3Access/s3');
const {
	getPlaceByPlaceId,
} = require('../databaseAccess/placesDatabaseAccess');
const { validateBySchema } = require('../utils/utils');
const { REVIEW_ID_SCHEMA, VALIDATE_CREATE_REVIEW_SCHEMA, VALIDATE_UPDATE_REVIEW_SCHEMA } = require('../schemas/reviewsSchemas');
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA, VALIDATE_UPDATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { USERNAME_SCHEMA } = require('../schemas/usersSchemas');
const { v4 } = require('uuid');
const { AWSErrorResponse } = require('../errors/AWSErrorResponse');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { transactionAddPlaceAndAddReview, transactionUpdatePlaceAndAddReview, transactionUpdatePlaceAndDeleteReview, transactionDeletePlaceAndDeleteReview, transactionUpdatePlaceAndUpdateReview } = require('../databaseAccess/transactDatabaseAccess');

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
			return new AWSErrorResponse(response.DBError);
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
			return new AWSErrorResponse(response.DBError);
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
			return new AWSErrorResponse(response.DBError);
		}

		return {
			success: true,
			reviewsExist: response.success,
			reviews: response.reviews,
		}
	}

	async getImagesCountForReview(reviewId) {
		const reviewIdSchemaResponse= validateBySchema(reviewId, REVIEW_ID_SCHEMA);
		if (!reviewIdSchemaResponse.isValid) {
			return new BadSchemaResponse(reviewIdSchemaResponse);
		}

		const response = await getImagesCountForReview(reviewId);

		if (response.S3Error) {
			return new AWSErrorResponse(response.S3Error);
		}

		return {
			success: response.success,
			numberOfImages: response.numberOfImages,
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
			return new AWSErrorResponse(response.DBError);
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
			return new AWSErrorResponse(getReviewByReviewIdResponse.DBError);
		}
		
		const reviewBeingDeleted = getReviewByReviewIdResponse.review;

		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(reviewBeingDeleted.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new AWSErrorResponse(getPlaceByPlaceIdResponse.DBError);
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
			return new AWSErrorResponse(response.DBError);
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
	async addReview(review, imageFiles) {
		const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
		if (!reviewSchemaResponse.isValid) {
			return new BadSchemaResponse(reviewSchemaResponse);
		}
		
		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(review.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new AWSErrorResponse(getPlaceByPlaceIdResponse.DBError);
		}
		const placeExists = getPlaceByPlaceIdResponse.success;
		
		let response;
		if (!placeExists) {
			response = await this.addPlaceAndAddReview(review, imageFiles);
		} else {
			response = await this.updatePlaceAndAddReview(getPlaceByPlaceIdResponse.place, review, imageFiles);
		}
		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
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
	async addPlaceAndAddReview(review, imageFiles) {
		const place = createNewPlaceFromReview(review);
		const placeSchemaResponse = validateBySchema(place, VALIDATE_CREATE_PLACE_SCHEMA);
		if (!placeSchemaResponse.isValid) {
			return new BadSchemaResponse(placeSchemaResponse);
		}
		review.reviewId = v4();
		review.images = await this.handleImagesFiles(review.reviewId, imageFiles);
		const response = await transactionAddPlaceAndAddReview(place, review);
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
	async updatePlaceAndAddReview(place, review, imageFiles) {
		let toUpdate = recalculateRatingsForAddingReviewToPlace(review, place);
		toUpdate.numberOfReviews++; 
		
		const placeSchemaResponse = validateBySchema(toUpdate, VALIDATE_UPDATE_PLACE_SCHEMA);
		if (!placeSchemaResponse.isValid) {
			return new BadSchemaResponse(placeSchemaResponse);
		}
		review.reviewId = v4();
		review.images = await this.handleImagesFiles(review.reviewId, imageFiles);
		const response = await transactionUpdatePlaceAndAddReview(toUpdate, review);
		return response;
	}

/**
 * Handles uploading image files for a given review and attaches the resulting image URLs.
 *
 * This asynchronous function checks if any image files are provided. If so, it uploads the images
 * using `uploadReviewImages` with the review's ID and then updates the review object with the returned
 * image URLs. In case of an error during the upload process, it returns an AWSErrorResponse.
 *
 * @async
 * @param {Object} review - The review object which must include a `reviewId` property.
 * @param {Array<File>} imageFiles - An array of image files to be uploaded.
 * @returns {Promise<Object|AWSErrorResponse>} A promise that resolves to the updated review object with 
 * attached image URLs, or an AWSErrorResponse if the image upload fails.
 */
	async handleImagesFiles(reviewId, imageFiles) {
		let imageURLs = [];
		if (imageFiles?.length > 0) {
			try {
				const images = await uploadReviewImages(imageFiles, reviewId);
				imageURLs = [...images];
			} catch (error) {
				return new AWSErrorResponse(error);
			}
		}
		return imageURLs;
	}

	/**
	 * updates review and updates place that the review is for,
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	DBError: ERROR || null
	 * }
	 * 
	 * @param {object} newReview 
	 * @returns {object}
	 */
	async updateReview(newReview) {
		const reviewSchemaResponse = validateBySchema(newReview, VALIDATE_UPDATE_REVIEW_SCHEMA);
		if (!reviewSchemaResponse.isValid) {
			return new BadSchemaResponse(reviewSchemaResponse);
		}
		
		const oldReviewResponse = await getReviewByReviewId(newReview.reviewId);
		if (oldReviewResponse.DBError) {
			return new AWSErrorResponse(oldReviewResponse.DBError);
		}
		const oldReview = oldReviewResponse.review;

		const getPlaceByPlaceIdResponse = await getPlaceByPlaceId(newReview.placeId);
		if (getPlaceByPlaceIdResponse.DBError) {
			return new AWSErrorResponse(getPlaceByPlaceIdResponse.DBError);
		}
		const toUpdate = getPlaceByPlaceIdResponse.place;
		const newPlace = recalculateRatingsForUpdatingReviewOnPlace(oldReview, newReview, toUpdate);
		
		const response = await transactionUpdatePlaceAndUpdateReview(newPlace, newReview);
		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}
		return response;
	}
}

module.exports = ReviewsHandler;
