const { 
	getPlaceByPlaceId,
	addPlace,
	getPlaces,
} = require('../databaseAccess/placesDatabaseAccess');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { validateBySchema } = require('../utils/utils');

class PlacesHandler {

	/**
	 * finds all places
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	places: [PLACE] || null
	 * }
	 * 
	 * @returns {object[]}
	 */
	async getPlaces() {
		const response = await getPlaces();
		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		return {
			success: true,
			places: response.places
		}
	}

	/**
	 * finds place that matches placeId
	 * 
	 * returns {
	 * 	success: boolean
	*   placeExists: boolean,
	*   place: PLACE || null
   * }
	 * 
	 * @param {string} placeId 
	 * @returns {object}
	 */
	async getPlaceByPlaceId(placeId) {
		const placeIdSchemaResponse = validateBySchema(placeId, PLACE_ID_SCHEMA);
		if (!placeIdSchemaResponse.isValid) {
			return new BadSchemaResponse(placeIdSchemaResponse);
		}

		const response = await getPlaceByPlaceId(placeId);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		return {
			success: true,
			placeExists: response.success,
			place: response.place,
		}
	}

	/**
	 * addes place
	 * 
	 * returns {
	 * 	sucess: boolean
	 * }
	 * 
	 * @param {object} place 
	 * @returns {object[]}
	 */
	async addPlace(place) {
		const placeSchemaReponse= validateBySchema(place, VALIDATE_CREATE_PLACE_SCHEMA);
		if (!placeSchemaReponse.isValid) {
			return new BadSchemaResponse(placeSchemaReponse);
		}

		const response = await addPlace(place);
		
		if (response.DBError) {
			return new DBErrorResponse(response.DBError);		}

		return {
			success: true
		};
	}
}

module.exports = PlacesHandler;
