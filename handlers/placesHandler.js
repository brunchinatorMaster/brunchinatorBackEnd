const { 
	getPlaceByPlaceId,
	addPlace,
} = require('../databaseAccess/placesDatabaseAccess');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { SchemaError } = require('../errors/SchemaError');
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { validateBySchema } = require('../utils/utils');
const { v4 } = require('uuid');

class PlacesHandler {

	/**
	 * finds place that matches placeId and
	 * returns {
 	 *   placeExists: boolean,
   *   place: object
   * }
	 * 
	 * @param {string} placeId 
	 * @returns {object}
	 */
	async getPlaceByPlaceId(placeId) {
		const placeIdIsValid = validateBySchema(placeId, PLACE_ID_SCHEMA);
		if (!placeIdIsValid.isValid) {
			return new BadSchemaResponse(400, placeIdIsValid.error.message);
		}

		const response = await getPlaceByPlaceId(placeId);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError?.$metadata?.httpStatusCode, response.DBError.message);
		}

		return {
			success: true,
			placeExists: response.success,
			place: response.place,
		}
	}

	/**
	 * addes place and returns all places
	 * 
	 * @param {object} place 
	 * @returns {object[]}
	 */
	async addPlace(place) {
		const validateResponse = validateBySchema(place, VALIDATE_CREATE_PLACE_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}
		place.placeId = v4();
		await addPlace(place);
		return {
			success: true
		};
	}
}

module.exports = PlacesHandler;
