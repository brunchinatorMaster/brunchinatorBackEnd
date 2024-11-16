const { 
	getPlaceByPlaceId,
	addPlace,
} = require('../databaseAccess/placesDatabaseAccess');
const { SchemaError } = require('../errors/SchemaError');
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { createNewPlaceFromReview } = require('../utils/placesUtils');
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
		const validateResponse = validateBySchema(placeId, PLACE_ID_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const placeToReturn = await getPlaceByPlaceId(placeId);
		return placeToReturn;
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
