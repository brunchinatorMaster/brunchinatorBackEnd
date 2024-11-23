const places = require('../mockDataBase/places');
const { 
  docClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand
} = require('../aws/awsClients');
const { DynamoError } = require('../errors/DynamoError');
const { deepCopy } = require('../utils/utils');

/**
 * finds place that has matching placeId
 * returns {
 *  success: boolean,
 *  place: place || null,
 *  DBError: error || null
 * }
 * 
 * @param {string} placeId 
 * @returns {object}
 */
const getPlaceByPlaceId = async (placeId) => {
  const queryCommand = new QueryCommand({
    TableName: 'Places',
    ExpressionAttributeValues: {
      ':placeId': placeId,
    },
    KeyConditionExpression: 'placeId = :placeId',
    ConsistentRead: true,
  });

  let success = false;
  let place;
  let DBError;
  try {
    const response = await docClient.send(queryCommand);
    if (response?.Items?.length > 0) {
      success = true;
      place = response.Items[0]
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      place,
      DBError
    }
  }
}

/**
 * adds place to dynamo
 * returns {
 *  success: boolean,
 *  DBError:error || null
 * }
 * @param {object} place 
 * @returns {object[]}
 */
const addPlace = async (place) => {
  const toPut = new PutCommand({
    TableName: 'Places',
    Item: place 
  });

  let success = false;
  let DBError;
  try {
    const response = await docClient.send(toPut);
    if (!response?.ValidationException) {
      success = true;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      DBError
    }
  }
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
  let success = false;
  let updatedPlace;
  let DBError;

  try {
    const response = await docClient.send(toUpdate);
    if (response?.Attributes) {
      success = true;
      updatedPlace = response.Attributes;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      place: updatedPlace,
      DBError
    }
  }
}

/**
 * deletes place that has matching placeId and returns all remaining places
 * 
 * @param {string} placeId 
 * @returns 
 */
const deletePlaceByPlaceId = async (placeId) => {
  const toDelete = new DeleteCommand({
    TableName: 'Places',
    Key: {
      placeId,
    }
  });
  let success = false;
  let DBError;
  try {
    const response = await docClient.send(toDelete);
    if (!response?.ValidationException) {
      success = true;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      review: null,
      DBError
    }
  }
};

module.exports = {
  getPlaceByPlaceId,
  addPlace,
  updatePlace,
  deletePlaceByPlaceId,
}
