const { 
  docClient,
  TransactWriteCommand
} = require('../aws/awsClients');

/**
 * Performs a transactional write operation to add a new review and its associated place.
 *
 * This asynchronous function constructs a transaction containing two Put operations:
 * one to insert the place object into the "Places" table and another to insert the review object into the "Reviews" table.
 * The transaction is executed using the AWS SDK's TransactWriteCommand. If the response's HTTP status code is 200,
 * the operation is considered successful. Any error encountered during the transaction is captured in the DBError field.
 *
 * @async
 * @param {Object} place - The place object to be added to the "Places" table.
 * @param {Object} review - The review object to be added to the "Reviews" table.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the transaction was executed successfully.
 *   - DBError {Error} (optional): The error encountered during the transaction, if any.
 */
const transactionAddPlaceAndAddReview = async (place, review) => {
  const toSend = {
    TransactItems: [
      {
        Put: {
          Item: place,
          TableName: 'Places'
        }
      },
      {
        Put: {
          Item: review,
          TableName: 'Reviews'
        }
      }
    ]
  }
  
  let success = false;
  let DBError;
  try {
    const command = new TransactWriteCommand(toSend);
    const response = await docClient.send(command);
    if(response?.$metadata?.httpStatusCode == 200) {
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
 * Executes a transactional write operation to update an existing place and add a new review.
 *
 * This asynchronous function performs a transaction that updates the attributes of a place in the "Places" table
 * and inserts a new review into the "Reviews" table. The place update uses an UpdateExpression to modify the following attributes:
 * bloody, burger, numberOfReviews, and overallRating. The transaction is executed using the AWS SDK's TransactWriteCommand.
 * If the response indicates a successful transaction (HTTP status code 200), the function returns success as true.
 * Any error encountered during the transaction is captured in the DBError field.
 *
 * @async
 * @param {Object} place - The place object containing updated attributes and keys for the "Places" table.
 *   Expected properties include:
 *   - placeId {string}: The unique identifier for the place.
 *   - placeName {string}: The name of the place.
 *   - bloody: The new value for the 'bloody' attribute.
 *   - burger: The new value for the 'burger' attribute.
 *   - numberOfReviews {number}: The updated number of reviews.
 *   - overallRating {number}: The updated overall rating.
 * @param {Object} review - The review object to be added to the "Reviews" table.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the transaction was executed successfully.
 *   - DBError {Error} (optional): The error encountered during the transaction, if any.
 */
const transactionUpdatePlaceAndAddReview = async (place, review) => {
  const toSend = {
    TransactItems: [
      {
        Update: {
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
        }
      },
      {
        Put: {
          Item: review,
          TableName: 'Reviews'
        }
      }
    ]
  }
  
  let success = false;
  let DBError;
  try {
    const command = new TransactWriteCommand(toSend);
    const response = await docClient.send(command);
    if(response?.$metadata?.httpStatusCode == 200) {
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
 * Executes a transactional write operation to delete a review and its associated place.
 *
 * This asynchronous function performs a transaction consisting of two Delete operations:
 * one to remove a place from the "Places" table and another to remove a review from the "Reviews" table.
 * The place is identified by its placeId and placeName, while the review is identified by its reviewId.
 * The transaction is executed using the AWS SDK's TransactWriteCommand. If the transaction completes successfully
 * (indicated by an HTTP status code of 200), the success flag is set to true. Any errors encountered during the transaction
 * are captured in the DBError field.
 *
 * @async
 * @param {string} placeId - The unique identifier of the place to be deleted.
 * @param {string} placeName - The name of the place to be deleted.
 * @param {string} reviewId - The unique identifier of the review to be deleted.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the transaction was executed successfully.
 *   - DBError {Error} (optional): The error encountered during the transaction, if any.
 */
const transactionDeletePlaceAndDeleteReview = async (placeId, placeName, reviewId) => {
  const toSend = {
    TransactItems: [
      {
        Delete: {
          TableName: 'Places',
          Key: {
            placeId,
            placeName,
          }
        }
      },
      {
        Delete: {
          TableName: 'Reviews',
          Key: {
            reviewId,
          }
        }
      }
    ]
  }
  
  let success = false;
  let DBError;
  try {
    const command = new TransactWriteCommand(toSend);
    const response = await docClient.send(command);
    if(response?.$metadata?.httpStatusCode == 200) {
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
 * Executes a transactional write operation to update a place and delete its associated review.
 *
 * This asynchronous function performs a transaction consisting of two operations:
 * 1. It updates a place in the "Places" table by modifying its attributes (bloody, burger, numberOfReviews, overallRating)
 *    using the provided place object. The place is identified by its placeId and placeName.
 * 2. It deletes a review from the "Reviews" table identified by the provided reviewId.
 *
 * The transaction is executed using the AWS SDK's TransactWriteCommand. If the response indicates a successful
 * transaction (HTTP status code 200), the function returns success as true. Any errors encountered during the transaction
 * are captured in the DBError field.
 *
 * @async
 * @param {Object} place - The place object to update. Must include:
 *   - placeId {string}: The unique identifier of the place.
 *   - placeName {string}: The name of the place.
 *   - bloody: The new value for the 'bloody' attribute.
 *   - burger: The new value for the 'burger' attribute.
 *   - numberOfReviews {number}: The updated number of reviews.
 *   - overallRating {number}: The updated overall rating.
 * @param {string} reviewId - The unique identifier of the review to be deleted.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the transaction was executed successfully.
 *   - DBError {Error} (optional): The error encountered during the transaction, if any.
 */
const transactionUpdatePlaceAndDeleteReview = async (place, reviewId) => {
  const toSend = {
    TransactItems: [
      {
        Update: {
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
        }
      },
      {
        Delete: {
          TableName: 'Reviews',
          Key: {
            reviewId,
          }
        }
      }
    ]
  }
  
  let success = false;
  let DBError;
  try {
    const command = new TransactWriteCommand(toSend);
    const response = await docClient.send(command);
    if(response?.$metadata?.httpStatusCode == 200) {
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
 * Executes a transactional write operation to update both a place and its associated review.
 *
 * This asynchronous function performs a transaction consisting of two Update operations:
 * 1. Updates a place in the "Places" table by modifying its attributes (bloody, burger, numberOfReviews, overallRating)
 *    using the provided place object. The place is identified by its placeId and placeName.
 * 2. Updates a review in the "Reviews" table by modifying its attributes (bloody, burger, words, reviewDate)
 *    using the provided review object. The review is identified by its reviewId.
 *
 * The transaction is executed using the AWS SDK's TransactWriteCommand. If the response indicates a successful
 * transaction (HTTP status code 200), the function returns success as true. Any errors encountered during the transaction
 * are captured in the DBError field.
 *
 * @async
 * @param {Object} place - The place object containing updated attributes and keys for the "Places" table.
 *   Expected properties include:
 *     - placeId {string}: The unique identifier for the place.
 *     - placeName {string}: The name of the place.
 *     - bloody: The new value for the 'bloody' attribute.
 *     - burger: The new value for the 'burger' attribute.
 *     - numberOfReviews {number}: The updated number of reviews.
 *     - overallRating {number}: The updated overall rating.
 * @param {Object} review - The review object containing updated attributes for the "Reviews" table.
 *   Expected properties include:
 *     - reviewId {string}: The unique identifier for the review.
 *     - bloody: The new value for the 'bloody' attribute.
 *     - burger: The new value for the 'burger' attribute.
 *     - words {string}: The updated review content.
 *     - reviewDate {string|Date}: The updated review date.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the transaction was executed successfully.
 *   - DBError {Error} (optional): The error encountered during the transaction, if any.
 */
const transactionUpdatePlaceAndUpdateReview = async (place, review) => {
  const toSend = {
    TransactItems: [
      {
        Update: {
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
        }
      },
      {
        Update: {
          TableName: 'Reviews',
          Key: {
            reviewId: review.reviewId,
          },
          UpdateExpression: 'set bloody = :bloody, burger = :burger, words = :words, reviewDate = :reviewDate',
          ExpressionAttributeValues: {
            ":bloody": review.bloody,
            ":burger": review.burger,
            ":words": review.words,
            ":reviewDate": review.reviewDate,
          },
          ReturnValues: "ALL_NEW",
        }
      },
    ]
  }
  
  let success = false;
  let DBError;
  try {
    const command = new TransactWriteCommand(toSend);
    const response = await docClient.send(command);
    if(response?.$metadata?.httpStatusCode == 200) {
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

module.exports = {
  transactionAddPlaceAndAddReview,
  transactionUpdatePlaceAndAddReview,
  transactionDeletePlaceAndDeleteReview,
  transactionUpdatePlaceAndDeleteReview,
  transactionUpdatePlaceAndUpdateReview
}