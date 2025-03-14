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
 * Retrieves reviews from the database.
 *
 * This asynchronous method calls the `getReviews` service function to fetch reviews.
 * If a database error occurs (indicated by `response.DBError`), it returns an AWSErrorResponse
 * with the error details. Otherwise, it returns an object with a success flag and the list of reviews.
 *
 * @async
 * @returns {Promise<Object|AWSErrorResponse>} A promise that resolves to either:
 *   - an object with a `success` property set to true and a `reviews` property containing the reviews array,
 *   - or an AWSErrorResponse if a database error occurred.
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
 * Retrieves a review by its unique review ID.
 *
 * This asynchronous method validates the provided reviewId against the REVIEW_ID_SCHEMA using
 * `validateBySchema`. If the validation fails, it returns a BadSchemaResponse with the validation details.
 * Otherwise, it fetches the review using `getReviewByReviewId`. If a database error occurs (indicated by
 * `response.DBError`), an AWSErrorResponse is returned. On success, it returns an object containing a success flag,
 * a boolean indicating if the review exists, and the review data.
 *
 * @async
 * @param {*} reviewId - The unique identifier for the review. Must conform to the REVIEW_ID_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to:
 *   - an object with properties:
 *     - `success`: {boolean} true,
 *     - `reviewExists`: {boolean} indicating if the review exists,
 *     - `review`: the review data,
 *   - a BadSchemaResponse if the reviewId fails schema validation,
 *   - an AWSErrorResponse if a database error occurs.
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
 * Retrieves reviews associated with a specific place ID.
 *
 * This asynchronous method first validates the provided placeId against the PLACE_ID_SCHEMA using
 * `validateBySchema`. If the validation fails, it returns a BadSchemaResponse with details of the validation errors.
 * If the validation is successful, it fetches the reviews by calling `getReviewsByPlaceId`. In case of a database error,
 * it returns an AWSErrorResponse. Otherwise, it returns an object containing a success flag, a boolean indicating
 * whether reviews exist, and the list of reviews.
 *
 * @async
 * @param {*} placeId - The unique identifier for the place, which must conform to PLACE_ID_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object with:
 *   - success: {boolean} indicating if the operation was successful,
 *   - reviewsExist: {boolean} indicating if reviews were found,
 *   - reviews: {Array} containing the reviews,
 * or a BadSchemaResponse if the validation fails, or an AWSErrorResponse if a database error occurs.
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

/**
 * Retrieves the number of images associated with a given review.
 *
 * This asynchronous method validates the provided reviewId against the REVIEW_ID_SCHEMA. 
 * If the validation fails, it returns a BadSchemaResponse with the validation details.
 * Otherwise, it fetches the count of images for the review by calling getImagesCountForReview.
 * If an S3 error occurs (indicated by response.S3Error), it returns an AWSErrorResponse.
 * On success, it returns an object containing a success flag and the number of images for the review.
 *
 * @async
 * @param {*} reviewId - The unique identifier for the review, which must adhere to REVIEW_ID_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object with:
 *   - success: {boolean} indicating if the operation was successful,
 *   - numberOfImages: {number} representing the count of images,
 * or an AWSErrorResponse if an S3 error occurs, or a BadSchemaResponse if the reviewId fails validation.
 */
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
 * Retrieves reviews associated with a specific username.
 *
 * This asynchronous method first validates the provided username against the USERNAME_SCHEMA using
 * `validateBySchema`. If the validation fails, it returns a BadSchemaResponse with the validation details.
 * If the validation is successful, it fetches the reviews by calling `getReviewsByUserName`.
 * If a database error occurs (indicated by `response.DBError`), it returns an AWSErrorResponse.
 * Otherwise, it returns an object containing a success flag, a boolean indicating if reviews exist,
 * and the list of reviews.
 *
 * @async
 * @param {*} userName - The username for which to retrieve reviews, expected to conform to USERNAME_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to:
 *   - an object with properties:
 *     - `success`: {boolean} true,
 *     - `reviewsExist`: {boolean} indicating if reviews were found,
 *     - `reviews`: {Array} containing the retrieved reviews,
 *   - or a BadSchemaResponse if the username fails validation,
 *   - or an AWSErrorResponse if a database error occurs.
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
 * Deletes a review by its review ID and updates the associated place accordingly.
 *
 * This asynchronous method performs the following steps:
 * 1. Validates the provided reviewId against the REVIEW_ID_SCHEMA using `validateBySchema`.
 *    If the validation fails, a BadSchemaResponse is returned.
 * 2. Retrieves the review details via `getReviewByReviewId`. If a database error occurs, an AWSErrorResponse is returned.
 * 3. Fetches the associated place details using `getPlaceByPlaceId` based on the review's placeId.
 *    If a database error occurs, an AWSErrorResponse is returned.
 * 4. Depending on the number of reviews linked to the place:
 *    - If the place has more than one review, the place is updated (using the private method `#updatePlaceForRemovingReview`)
 *      and the review is deleted via `transactionUpdatePlaceAndDeleteReview`.
 *    - If the review is the only one for the place, both the place and review are deleted using
 *      `transactionDeletePlaceAndDeleteReview`.
 * 5. If a database error occurs during the transaction, an AWSErrorResponse is returned.
 * 6. On success, returns the transaction response.
 *
 * @async
 * @param {*} reviewId - The unique identifier of the review to be deleted, which must conform to REVIEW_ID_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to the transaction response,
 * or an error response (AWSErrorResponse or BadSchemaResponse) if any validation or database error occurs.
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
 * Recalculates the ratings and decrements the review count for a place after a review is removed.
 *
 * This private asynchronous method updates a place object by recalculating its ratings to reflect the removal 
 * of a given review using the `recalculateRatingsForRemovingReviewFromPlace` helper function, and then decrements 
 * the `numberOfReviews` property.
 *
 * @async
 * @private
 * @param {Object} review - The review object that is being removed.
 * @param {Object} placeToUpdate - The place object to update, expected to include rating details and a review count.
 * @returns {Promise<Object>} A promise that resolves to the updated place object with recalculated ratings and a decremented review count.
 */
	async #updatePlaceForRemovingReview(review, placeToUpdate) {
		placeToUpdate = recalculateRatingsForRemovingReviewFromPlace(review, placeToUpdate);
		placeToUpdate.numberOfReviews--;
		return placeToUpdate;
	}

/**
 * Adds a new review along with associated image files.
 *
 * This asynchronous method performs the following steps:
 * 1. Validates the provided review object against the VALIDATE_CREATE_REVIEW_SCHEMA using `validateBySchema`.
 *    If validation fails, it returns a BadSchemaResponse.
 * 2. Checks if the place associated with the review (via review.placeId) exists by calling `getPlaceByPlaceId`.
 *    If a database error occurs during this check, an AWSErrorResponse is returned.
 * 3. If the place does not exist, it creates a new place and adds the review by calling `addPlaceAndAddReview`.
 *    Otherwise, if the place exists, it updates the place and adds the review by calling `updatePlaceAndAddReview`.
 * 4. If a database error occurs during the review addition or update, an AWSErrorResponse is returned.
 * 5. Returns the final response from the add/update review process.
 *
 * @async
 * @param {Object} review - The review object to be added. It must conform to the VALIDATE_CREATE_REVIEW_SCHEMA and include a valid placeId property.
 * @param {Array<File>} imageFiles - An array of image files associated with the review.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to the response of the review addition process,
 * or an error response (AWSErrorResponse or BadSchemaResponse) if any validation or database error occurs.
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
 * Creates a new place from a review and adds the review (with associated images) to that place.
 *
 * This asynchronous method performs the following steps:
 * 1. Generates a new place object based on the review using `createNewPlaceFromReview`.
 * 2. Validates the generated place against the `VALIDATE_CREATE_PLACE_SCHEMA` using `validateBySchema`.
 *    If validation fails, it returns a `BadSchemaResponse`.
 * 3. Generates a new unique review ID using `v4()` and assigns it to the review.
 * 4. Processes any image files associated with the review by calling `this.handleImagesFiles`.
 * 5. Executes a transaction to add the new place and review by calling `transactionAddPlaceAndAddReview`.
 *
 * @async
 * @param {Object} review - The review object containing data for the new review and place. It must include properties
 *   that can be used to create a place.
 * @param {Array<File>} imageFiles - An array of image files associated with the review.
 * @returns {Promise<Object|BadSchemaResponse>} A promise that resolves to the response from the transaction to add the place
 * and review, or a `BadSchemaResponse` if the place fails validation.
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
 * Updates an existing place with a new review and adds the review to the place.
 *
 * This asynchronous method performs the following steps:
 * 1. Recalculates the ratings for the place to reflect the addition of the new review using
 *    `recalculateRatingsForAddingReviewToPlace`.
 * 2. Increments the `numberOfReviews` property of the place.
 * 3. Validates the updated place object against the `VALIDATE_UPDATE_PLACE_SCHEMA` using `validateBySchema`.
 *    If validation fails, it returns a BadSchemaResponse with the validation details.
 * 4. Generates a new unique review ID using `v4()` and assigns it to the review.
 * 5. Processes any image files associated with the review by calling `this.handleImagesFiles`.
 * 6. Executes a transaction to update the place and add the review via `transactionUpdatePlaceAndAddReview`.
 *
 * @async
 * @param {Object} place - The existing place object to update.
 * @param {Object} review - The review object to be added to the place.
 * @param {Array<File>} imageFiles - An array of image files associated with the review.
 * @returns {Promise<Object|BadSchemaResponse>} A promise that resolves to the transaction response
 * or a BadSchemaResponse if the updated place fails validation.
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
 * Updates an existing review and recalculates the associated place's ratings accordingly.
 *
 * This asynchronous method performs the following steps:
 * 1. Validates the provided newReview object against the VALIDATE_UPDATE_REVIEW_SCHEMA using `validateBySchema`.
 *    If validation fails, it returns a BadSchemaResponse with the validation details.
 * 2. Retrieves the existing review using `getReviewByReviewId` based on newReview.reviewId.
 *    If a database error occurs, it returns an AWSErrorResponse.
 * 3. Retrieves the associated place details using `getPlaceByPlaceId` based on newReview.placeId.
 *    If a database error occurs, it returns an AWSErrorResponse.
 * 4. Recalculates the place's ratings to reflect the updated review by calling
 *    `recalculateRatingsForUpdatingReviewOnPlace` with the old review, the new review, and the current place data.
 * 5. Executes a transaction to update both the place and the review using `transactionUpdatePlaceAndUpdateReview`.
 *    If a database error occurs during the transaction, it returns an AWSErrorResponse.
 * 6. Returns the transaction response upon successful update.
 *
 * @async
 * @param {Object} newReview - The updated review object. It must conform to the VALIDATE_UPDATE_REVIEW_SCHEMA and include a valid reviewId and placeId.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to the transaction response,
 * or an error response (AWSErrorResponse or BadSchemaResponse) if any validation or database error occurs.
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
