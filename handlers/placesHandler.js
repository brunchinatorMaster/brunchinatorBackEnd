const { 
	getPlaceByPlaceId,
	addPlace,
	getPlaces,
} = require('../databaseAccess/placesDatabaseAccess');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { AWSErrorResponse } = require('../errors/AWSErrorResponse');
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { validateBySchema } = require('../utils/utils');

class PlacesHandler {

/**
 * Retrieves a list of places.
 *
 * This asynchronous method calls the `getPlaces` service function to fetch places from the database.
 * If the response contains a DBError, it returns an AWSErrorResponse with the error details.
 * Otherwise, it returns an object with a success flag set to true and an array of places.
 *
 * @async
 * @returns {Promise<Object|AWSErrorResponse>} A promise that resolves to an object with:
 *   - success {boolean}: Indicates whether the operation was successful.
 *   - places {Array}: An array of place objects.
 *   Or an AWSErrorResponse if a database error occurs.
 */
	async getPlaces() {
		const response = await getPlaces();
		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		return {
			success: true,
			places: response.places
		}
	}

/**
 * Retrieves a place by its unique place ID.
 *
 * This asynchronous method validates the provided placeId against the PLACE_ID_SCHEMA using `validateBySchema`.
 * If validation fails, it returns a BadSchemaResponse with the validation errors.
 * Otherwise, it fetches the place details using `getPlaceByPlaceId`.
 * If a database error occurs, it returns an AWSErrorResponse.
 * On success, it returns an object containing a success flag, a boolean indicating whether the place exists,
 * and the place details.
 *
 * @async
 * @param {*} placeId - The unique identifier for the place, which must adhere to PLACE_ID_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object with:
 *   - success: {boolean} indicating if the operation was successful,
 *   - placeExists: {boolean} indicating if the place was found,
 *   - place: {Object} containing the place details,
 * or an AWSErrorResponse/BadSchemaResponse if an error occurs.
 */
	async getPlaceByPlaceId(placeId) {
		const placeIdSchemaResponse = validateBySchema(placeId, PLACE_ID_SCHEMA);
		if (!placeIdSchemaResponse.isValid) {
			return new BadSchemaResponse(placeIdSchemaResponse);
		}

		const response = await getPlaceByPlaceId(placeId);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		return {
			success: true,
			placeExists: response.success,
			place: response.place,
		}
	}

/**
 * Adds a new place to the system.
 *
 * This asynchronous method performs the following steps:
 * 1. Validates the provided place object against the VALIDATE_CREATE_PLACE_SCHEMA using `validateBySchema`.
 *    If the validation fails, it returns a BadSchemaResponse with the validation errors.
 * 2. Calls the `addPlace` service function to insert the new place into the database.
 * 3. If a database error occurs during the insertion, it returns an AWSErrorResponse.
 * 4. On success, it returns an object with a success flag set to true.
 *
 * @async
 * @param {Object} place - The place object to be added. Must adhere to the VALIDATE_CREATE_PLACE_SCHEMA.
 * @returns {Promise<Object|BadSchemaResponse|AWSErrorResponse>} A promise that resolves to an object with:
 *   - success: {boolean} indicating the operation was successful,
 * or an error response (BadSchemaResponse or AWSErrorResponse) if validation or database insertion fails.
 */
	async addPlace(place) {
		const placeSchemaReponse= validateBySchema(place, VALIDATE_CREATE_PLACE_SCHEMA);
		if (!placeSchemaReponse.isValid) {
			return new BadSchemaResponse(placeSchemaReponse);
		}

		const response = await addPlace(place);
		
		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);		}

		return {
			success: true
		};
	}
}

module.exports = PlacesHandler;
