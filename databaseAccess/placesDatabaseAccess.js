const places = require('../mockDataBase/places');
const { 
  docClient,
  PutCommand,
  QueryCommand,
} = require('../aws/awsClients');
const { DynamoError } = require('../errors/DynamoError');

/**
 * returns place that has matching placeId
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
  if(response?.Items?.length > 0) {
    return response.Items[0];
  }
  throw new DynamoError(404, `No Place Found with placeId: ${placeId}`);
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
  return response;
}

/**
 * updates place and then returns all places
 * 
 * @param {object} place 
 * @returns 
 */
const updatePlace = async (place) => {
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
const deletePlaceByPlaceId = async (placeId) => {
  // TODO this will be replaced with either a delete call to the database
  const mockPlaces = JSON.parse(JSON.stringify(places));
  return mockPlaces.filter((place) => place.placeId !== placeId);
};

module.exports = {
  getPlaceByPlaceId,
  addPlace,
  updatePlace,deletePlaceByPlaceId,
}
