const places = require('../mockDataBase/places');

/**
 * returns all places
 * 
 * @returns {object[]}
 */
const getAllPlaces = () => {
  // TODO this will be replaced with a call to the database to get all places
  // at some point i may introduce pagination, not sure yet
  const mockPlaces = JSON.parse(JSON.stringify(places));
  return mockPlaces;
}

/**
 * returns place that has matching placeId
 * 
 * @param {string} placeId 
 * @returns {object}
 */
const getPlaceByPlaceId = (placeId) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one place by id, or some filtering of allPlaces
  const mockPlaces = JSON.parse(JSON.stringify(places));
  return mockPlaces.filter((place) => place.placeId == placeId)?.[0] ?? null;
}

/**
 * adds place and then returns all places
 * 
 * @param {object} place 
 * @returns {object[]}
 */
const addPlace = (place) => {
  // TODO this will be replaced with either a call to add a new record to the
  // mockPlaces table in the database
  const mockPlaces = JSON.parse(JSON.stringify(places));
  mockPlaces.push(place);
  return mockPlaces;
}

/**
 * updates place and then returns all places
 * 
 * @param {object} place 
 * @returns 
 */
const updatePlace = (place) => {
  // TODO this will be replaced with either a patch call to update a record in the
  // mockPlaces table in the database
  const mockPlaces = JSON.parse(JSON.stringify(places));
  let indexToUpdate = mockPlaces.findIndex(p => p.placeId == place.placeId );
  mockPlaces[indexToUpdate] = place;
  return mockPlaces;
}

/**
 * deletes place that has matching placeId and returns all remaining places
 * 
 * @param {string} placeId 
 * @returns 
 */
const deletePlaceByPlaceId = (placeId) => {
  // TODO this will be replaced with either a delete call to the database
  const mockPlaces = JSON.parse(JSON.stringify(places));
  return mockPlaces.filter((place) => place.placeId !== placeId);
};

module.exports = {
  getAllPlaces,
  getPlaceByPlaceId,
  addPlace,
  updatePlace,deletePlaceByPlaceId,
}
