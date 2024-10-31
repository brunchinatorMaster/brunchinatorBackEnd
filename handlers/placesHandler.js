const { 
	getAllPlaces, 
	getPlaceByPlaceId,
	addPlace,
} = require('../databaseAccess/placesDatabaseAccess');

class PlacesHandler {

	/**
	 * returns all places
	 * 
	 * @returns {object[]}
	 */
	getPlaces() {
		const allPlaces = getAllPlaces();
		// TODO do business logic, if any
		return allPlaces;
	}

	/**
	 * returns place that matches placeId
	 * 
	 * @param {string} placeId 
	 * @returns {object}
	 */
	getPlaceByPlaceId(placeId) {
		const placeToReturn = getPlaceByPlaceId(placeId);
		// TODO do business logic, if any
		return placeToReturn;
	}

	/**
	 * addes place and returns all places
	 * 
	 * @param {object} place 
	 * @returns {object[]}
	 */
	addPlace(place) {
		const allPlaces = addPlace(place);
		// TODO do business logic, if any
		return allPlaces;
	}
}

module.exports = PlacesHandler;
