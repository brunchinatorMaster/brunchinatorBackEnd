const { 
  docClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} = require('../aws/awsClients');

/**
 * Retrieves a list of reviews from the "Reviews" table in DynamoDB.
 *
 * This asynchronous function uses the AWS SDK's ScanCommand to scan the "Reviews" table with a projection
 * expression that retrieves specific attributes: reviewId, placeId, userName, placeName, bloody, burger, reviewDate, and words.
 * If one or more review items are found, it sets the success flag to true and returns the list of reviews.
 * Any error encountered during the scan is captured in the DBError property.
 *
 * @async
 * @returns {Promise<{success: boolean, reviews?: Array<Object>, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if reviews were successfully retrieved.
 *   - reviews {Array<Object>} (optional): The array of review objects retrieved from the table.
 *   - DBError {Error} (optional): The error encountered during the scan, if any.
 */
const getReviews = async () => {
  const scanCommand = new ScanCommand({
    TableName: "Reviews",
    ProjectionExpression: 'reviewId, placeId, userName, placeName, bloody, burger, reviewDate, words',
  });
  let success = false;
  let reviews;
  let DBError;
  try {
    const response = await docClient.send(scanCommand);
    if (response?.Items?.length > 0) {
      success = true;
      reviews = response.Items
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      reviews,
      DBError
    }
  }
}

/**
 * Retrieves a review from the "Reviews" table by its unique reviewId.
 *
 * This asynchronous function executes a QueryCommand on the "Reviews" table using a key condition expression
 * to filter results based on the provided reviewId. It performs a consistent read to ensure the data is up-to-date.
 * If a review is found, it sets the success flag to true and returns the first matching review.
 * Any errors encountered during the query are captured in the DBError property.
 *
 * @async
 * @param {string} reviewId - The unique identifier of the review to retrieve.
 * @returns {Promise<{success: boolean, review?: Object, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the review was successfully retrieved.
 *   - review {Object} (optional): The review object retrieved from the table, if found.
 *   - DBError {Error} (optional): The error encountered during the query, if any.
 */
const getReviewByReviewId = async (reviewId) => {
  const queryCommand = new QueryCommand({
    TableName: 'Reviews',
    ExpressionAttributeValues: {
      ':reviewId': reviewId,
    },
    KeyConditionExpression: 'reviewId = :reviewId',
    ConsistentRead: true,
  });

  let success = false;
  let review;
  let DBError;
  try {
    const response = await docClient.send(queryCommand);
    if (response?.Items?.length > 0) {
      success = true;
      review = response.Items[0]
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      review,
      DBError
    }
  }
}

/**
 * Retrieves reviews from the "Reviews" table in DynamoDB by a specific placeId.
 *
 * This asynchronous function uses the AWS SDK's ScanCommand to scan the "Reviews" table.
 * It applies a filter expression to retrieve only reviews where the placeId matches the provided value.
 * The function returns a list of reviews with selected attributes: reviewId, placeId, userName, placeName,
 * bloody, burger, reviewDate, and words. Any error encountered during the scan is captured in the DBError field.
 *
 * @async
 * @param {string} placeId - The unique identifier of the place for which reviews are to be retrieved.
 * @returns {Promise<{success: boolean, reviews?: Array<Object>, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if one or more reviews were successfully retrieved.
 *   - reviews {Array<Object>} (optional): An array of review objects, if any were found.
 *   - DBError {Error} (optional): The error encountered during the scan, if any.
 */
const getReviewsByPlaceId = async (placeId) => {
  const scanCommand = new ScanCommand({
    TableName: 'Reviews',
    ExpressionAttributeValues: {
      ':placeId': placeId,
    },
    FilterExpression: 'placeId = :placeId',
    ProjectionExpression: 'reviewId, placeId, userName, placeName, bloody, burger, reviewDate, words',
  });

  let success = false;
  let reviews;
  let DBError;
  try {
    const response = await docClient.send(scanCommand);
    if (response?.Items?.length > 0) {
      success = true;
      reviews = response.Items
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      reviews,
      DBError
    }
  }
}

/**
 * Retrieves reviews from the "Reviews" table in DynamoDB filtered by a specific username.
 *
 * This asynchronous function uses the AWS SDK's ScanCommand to scan the "Reviews" table and applies a filter expression
 * to return only the reviews where the userName matches the provided value. The response includes selected attributes:
 * reviewId, placeId, userName, placeName, bloody, burger, reviewDate, and words.
 * Any error encountered during the scan is captured in the DBError field.
 *
 * @async
 * @param {string} userName - The username for which to retrieve reviews.
 * @returns {Promise<{success: boolean, reviews?: Array<Object>, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if one or more reviews were successfully retrieved.
 *   - reviews {Array<Object>} (optional): An array of review objects, if any were found.
 *   - DBError {Error} (optional): The error encountered during the scan, if any.
 */
const getReviewsByUserName = async (userName) => {
  const scanCommand = new ScanCommand({
    TableName: 'Reviews',
    ExpressionAttributeValues: {
      ':userName': userName,
    },
    FilterExpression: 'userName = :userName',
    ProjectionExpression: 'reviewId, placeId, userName, placeName, bloody, burger, reviewDate, words',
  });

  let success = false;
  let reviews;
  let DBError;
  try {
    const response = await docClient.send(scanCommand);
    if (response?.Items?.length > 0) {
      success = true;
      reviews = response.Items
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      reviews,
      DBError
    }
  }
}

/**
 * Deletes a review from the "Reviews" table in DynamoDB using its reviewId.
 *
 * This asynchronous function uses the AWS SDK's DeleteCommand to remove a review identified by the provided reviewId.
 * It sends the deletion command via docClient. If the response does not indicate a ValidationException, the deletion is considered successful.
 * Any errors encountered during the deletion process are captured in the DBError field.
 *
 * @async
 * @param {string} reviewId - The unique identifier of the review to be deleted.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the review was successfully deleted.
 *   - DBError {Error} (optional): The error encountered during the deletion, if any.
 */
const deleteReviewByReviewId = async (reviewId) => {
  const toDelete = new DeleteCommand({
    TableName: 'Reviews',
    Key: {
      reviewId,
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
}

/**
 * Adds a new review to the "Reviews" table in DynamoDB.
 *
 * This asynchronous function uses the AWS SDK's PutCommand to insert the provided review object
 * into the "Reviews" table. If the operation completes without a ValidationException in the response,
 * the function sets the success flag to true. Any errors encountered during the operation are captured
 * in the DBError field.
 *
 * @async
 * @param {Object} review - The review object to be added to the DynamoDB "Reviews" table.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the review was added successfully.
 *   - DBError {Error} (optional): The error encountered during the operation, if any.
 */
const addReview = async (review) => {
  const toPut = new PutCommand({
    TableName: 'Reviews',
    Item: review 
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

module.exports = {
  getReviews,
  getReviewByReviewId,
  getReviewsByPlaceId,
  getReviewsByUserName,
  deleteReviewByReviewId,
  addReview
}
