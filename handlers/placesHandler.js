const { 
	getPlaceByPlaceId,
	addPlace,
	getPlaces,
} = require('../databaseAccess/placesDatabaseAccess');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { AWSErrorResponse } = require('../errors/AWSErrorResponse');
const { PLACE_ID_SCHEMA, VALIDATE_CREATE_PLACE_SCHEMA } = require('../schemas/placesSchemas');
const { validateBySchema } = require('../utils/utils');
	
const { GOOGLE_API_KEY } = require('../google/config');
const { setWithTTL, getWithTTL } = require('../utils/cacheWithTTL');

const axios = require('axios');
const photoCache = new Map(); // placeId -> { value, expires }
const photoUrlCache = new Map(); // photoRef -> { value, expires }

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

/**
 * Retrieves a proxied photo URL for a given Google Place ID.
 *
 * This asynchronous method attempts to retrieve a cached `photoRef` for the given placeId.
 * If not found in cache, it fetches Place Details from the Google Places API to extract the photo reference,
 * caches it with a TTL, and returns a URL that can be used to fetch the actual photo via the `/api/v1/photo` proxy.
 * If no photos are found or an error occurs, it returns a fallback to `/defaultPlace.jpg`.
 *
 * @async
 * @param {string} placeId - The unique Google Place ID to fetch a photo reference for.
 * @returns {Promise<Object>} A promise that resolves to an object with:
 *   - photoUrl: {string} A URL to the photo proxy or a fallback default image.
 */
	async getPhotoRef(placeId) {
		const apiKey = GOOGLE_API_KEY;

		// Check cache
		const cachedPhotoRef = getWithTTL(photoCache, placeId);
		if (cachedPhotoRef) {
			console.log('returning photoRef from TTL cache');
			return { photoUrl: `/api/v1/photo?photoRef=${cachedPhotoRef}` };
		}

		try {
			const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
	
			const response = await axios.get(detailsUrl);
			const photos = response?.data?.result?.photos;
	
			if (!response || !photos?.length) {
				return { photoUrl: '/defaultPlace.jpg' };
			}
	
			const photoReference = photos[0].photo_reference;
	
			// Store in cache
			setWithTTL(photoCache, placeId, photoReference);

	
			const proxiedPhotoUrl = `api/v1/photo?photoRef=${photoReference}`;
			return { photoUrl: proxiedPhotoUrl };
		} catch (error) {
			console.error(error);
			console.error('Axios error:', {
				message: err.message,
				status: err.response?.status,
				url: err.config?.url
			});
			return { photoUrl: '/defaultPlace.jpg' };
		}
	}

/**
 * Retrieves a final photo URL to be used in an image redirect response.
 *
 * This asynchronous method checks if the requested photo reference is already cached.
 * If found, it returns the cached URL to Google's static photo CDN.
 * If not found, it performs a zero-redirect request to Google's photo API to extract the final
 * `lh3.googleusercontent.com/...` URL, caches it with a TTL, and returns it.
 * If an error occurs or the redirect is missing, an exception is thrown.
 *
 * @async
 * @param {string} photoRef - The Google photo reference string obtained from Place Details.
 * @param {number|string} maxwidth - The maximum image width (used in the API request).
 * @param {number|string} maxheight - The maximum image height (used in the API request).
 * @returns {Promise<string>} A promise that resolves to a final image URL from Google’s CDN.
 * @throws Will throw an error if the photoRef is missing or if the redirect URL cannot be retrieved.
 */
	async getPhoto(photoRef, maxwidth, maxheight) {
		if (!photoRef) {
			throw Error('Missing photoRef');
		}
		const apiKey = GOOGLE_API_KEY;

		// Serve from cache if we already know the final URL
		const cachedFinalUrl = getWithTTL(photoUrlCache, photoRef);
		if (cachedFinalUrl) {
			console.log('returning final photo URL from TTL cache');
			return cachedFinalUrl;
		}

		try {
			const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&key=${apiKey}&maxwidth=${maxwidth}&maxheight=${maxheight}`;
	
			// Get the final image redirect URL
			const response = await axios.get(googlePhotoUrl, {
				maxRedirects: 0,
				validateStatus: (status) => status >= 200 && status < 400,
			});
	
			const finalUrl = response.headers.location;
	
			if (!finalUrl) throw new Error('No redirect found');
	
			// Cache the final redirect
			setWithTTL(photoUrlCache, photoRef, finalUrl);

			return finalUrl;
		} catch (err) {
			console.error('Error fetching photo from Google:', err.message);
			console.error('Axios error:', {
				message: err.message,
				status: err.response?.status,
				url: err.config?.url
			});
			throw Error('Unable to fetch photo');
		}
	}
}

module.exports = PlacesHandler;
