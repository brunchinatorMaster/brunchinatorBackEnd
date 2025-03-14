
const { 
  docClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require('../aws/awsClients');

/**
 * Retrieves a list of places from the "Places" table in DynamoDB.
 *
 * This asynchronous function uses the AWS SDK's ScanCommand to scan the "Places" table
 * with a projection expression for specific attributes (placeId, placeName, vicinity, bloody, burger,
 * numberOfReviews, overallRating). If items are found, it sets the success flag to true and returns
 * the list of places. In case of an error during the scan, the error is captured in the DBError property.
 *
 * @async
 * @returns {Promise<{success: boolean, places?: Array<Object>, DBError?: Error}>} A promise that resolves
 * to an object containing:
 *   - success {boolean}: Indicates if the operation was successful.
 *   - places {Array<Object>} (optional): An array of place objects if found.
 *   - DBError {Error} (optional): The error encountered during the scan, if any.
 */
const getPlaces = async () => {
  const scanCommand = new ScanCommand({
    TableName: "Places",
    ProjectionExpression: 'placeId, placeName, vicinity, bloody, burger, numberOfReviews, overallRating',
  });
  let success = false;
  let places;
  let DBError;
  try {
    const response = await docClient.send(scanCommand);
    if (response?.Items?.length > 0) {
      success = true;
      places = response.Items
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      places,
      DBError
    }
  }
}

/**
 * Retrieves a place from the "Places" table by its unique placeId.
 *
 * This asynchronous function executes a QueryCommand on the "Places" table using a key condition
 * expression to filter results by the provided placeId. It uses a consistent read to ensure the most recent data.
 * If a place is found, the function returns the first matching item with a success flag set to true.
 * Any error encountered during the query is captured in the DBError field.
 *
 * @async
 * @param {string} placeId - The unique identifier of the place to retrieve.
 * @returns {Promise<{success: boolean, place?: Object, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if a place was successfully retrieved.
 *   - place {Object} (optional): The retrieved place object, if found.
 *   - DBError {Error} (optional): The error encountered during the query, if any.
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
 * Adds a new place to the "Places" table in DynamoDB.
 *
 * This asynchronous function uses the AWS SDK's PutCommand to insert the provided place object into the "Places" table.
 * If the operation is successful (i.e., the response does not include a ValidationException), the function sets the success flag to true.
 * Any errors encountered during the operation are captured in the DBError property.
 *
 * @async
 * @param {Object} place - The place object to be added to the DynamoDB "Places" table.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the place was added successfully.
 *   - DBError {Error} (optional): The error encountered during the operation, if any.
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
 * Updates an existing place in the "Places" table in DynamoDB.
 *
 * This asynchronous function uses the AWS SDK's UpdateCommand to update specific attributes of a place.
 * It updates the attributes: bloody, burger, numberOfReviews, and overallRating for the place identified by its placeId and placeName.
 * If the update is successful, it returns the updated place data with a success flag set to true.
 * Any errors encountered during the update operation are captured in the DBError field.
 *
 * @async
 * @param {Object} place - The place object containing the updated attributes. It must include:
 *   - placeId {string}: The unique identifier of the place.
 *   - placeName {string}: The name of the place.
 *   - bloody {number|string}: The new value for the 'bloody' attribute.
 *   - burger {number|string}: The new value for the 'burger' attribute.
 *   - numberOfReviews {number}: The updated number of reviews.
 *   - overallRating {number}: The updated overall rating.
 * @returns {Promise<{success: boolean, place?: Object, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the update was successful.
 *   - place {Object} (optional): The updated place object returned by DynamoDB.
 *   - DBError {Error} (optional): The error encountered during the update, if any.
 */
const updatePlace = async (place) => {
  const toUpdate = new UpdateCommand({
    TableName: 'Places',
    Key: {
      placeId: place.placeId,
      placeName: place.placeName,
    },
    UpdateExpression: 'set bloody = :bloody, burger = :burger, numberOfReviews = :numberOfReviews, overallRating = :overallRating',
    ExpressionAttributeValues: {
      ":bloody": place.bloody,
      ":burger": place.burger,
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
 * Deletes a place from the "Places" table in DynamoDB using its placeId.
 *
 * This asynchronous function uses the AWS SDK's DeleteCommand to remove a place identified by the provided placeId.
 * It sends the deletion command using docClient. If no ValidationException occurs, the deletion is considered successful.
 * Any errors encountered during the deletion are captured in the DBError field.
 *
 * @async
 * @param {string} placeId - The unique identifier of the place to be deleted.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the deletion was successful.
 *   - DBError {Error} (optional): The error encountered during deletion, if any.
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
      DBError
    }
  }
};

module.exports = {
  getPlaceByPlaceId,
  addPlace,
  updatePlace,
  deletePlaceByPlaceId,
  getPlaces,
}
