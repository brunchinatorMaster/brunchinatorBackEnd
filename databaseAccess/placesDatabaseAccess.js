const places = require('../mockDataBase/places');
const { 
  docClient,
  PutCommand,
  QueryCommand,
  UpdateCommand
} = require('../aws/awsClients');
const { DynamoError } = require('../errors/DynamoError');

/**
 * returns place that has matching placeId
 * returns {
 *   placeExists: boolean,
 *   place: object
 * }
 * 
 * @param {string} placeId 
 * @returns {object}
 */
const getPlaceByPlaceId = async (placeId) => {
  if (!placeId) {
    throw new DynamoError(400, 'placeId must not be null');
  }

  const queryCommand = new QueryCommand({
    TableName: 'Places',
    ExpressionAttributeValues: {
      ':placeId': placeId,
    },
    KeyConditionExpression: 'placeId = :placeId',
    ConsistentRead: true,
  });

  const response = await docClient.send(queryCommand);

  if (response?.Items?.length > 0) {
    return {
      placeExists: true,
      place: response.Items[0]
    }
  }
  return {
    placeExists: false,
    place: null
  }
}

/**
 * adds place to dynamo
 * 
 * @param {object} place 
 * @returns {object[]}
 */
const addPlace = async (place) => {
  const toPut = new PutCommand({
    TableName: 'Places',
    Item: place 
  });
  const response = await docClient.send(toPut);
  return {
    success: true,
  };
}

/**
 * updates place and returns {
 *  success: boolean,
 *  updatedPlace: object
 * }
 * 
 * @param {object} place 
 * @returns 
 */
const updatePlace = async (place) => {
  const toUpdate = new UpdateCommand({
    TableName: 'Places',
    Key: {
      placeId: place.placeId,
      placeName: place.placeName,
    },
    UpdateExpression: 'set beers = :beers, bloody = :bloody, burger = :burger, benny = :benny, numberOfReviews = :numberOfReviews, overallRating = :overallRating',
    ExpressionAttributeValues: {
      ":beers": place.beers,
      ":bloody": place.bloody,
      ":burger": place.burger,
      ":benny": place.benny,
      ":numberOfReviews": place.numberOfReviews,
      ":overallRating": place.overallRating,
    },
    ReturnValues: "ALL_NEW",
  });
  await docClient.send(toUpdate);
  return {
    success: true,
    updatedPlace: response.Attributes,
  };
}

/**
 * deletes place that has matching placeId and returns all remaining places
 * 
 * @param {string} placeId 
 * @returns 
 */
const deletePlaceByPlaceId = async (placeId) => {
  // TODO this will be replaced with either a delete call to the database
  const mockPlaces = JSON.parse(JSON.stringify(places));
  return mockPlaces.filter((place) => place.placeId !== placeId);
};

module.exports = {
  getPlaceByPlaceId,
  addPlace,
  updatePlace,
  deletePlaceByPlaceId,
}
