const { 
  docClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} = require('../aws/awsClients');

/**
 * gets all reviews
 * returns {
 *  success: boolean,
 *  reviews: REVIEW || null
 *  DBError: ERROR || null
 * }
 * @returns {object[]}
 */
const getReviews = async () => {
  const scanCommand = new ScanCommand({
    TableName: "Reviews",
    ProjectionExpression: 'reviewId, placeId, userName, placeName, beers, bloody, burger, reviewDate, words',
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
 * finds review that matches reviewId
 * returns {
 *  success: boolean,
 *  reviews: REVIEW || null
 *  DBError: ERROR || null
 * }
 * 
 * @param {string} reviewId 
 * @returns {object}
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
 * finds all reviews that are for place that matches placeId
 * 
 * returns {
 *  success: boolean,
 *  reviews: [REVIEW] || null
 *  DBError: ERROR || null
 * }
 * 
 * @param {string} placeId 
 * @returns {object[]}
 */
const getReviewsByPlaceId = async (placeId) => {
  const scanCommand = new ScanCommand({
    TableName: 'Reviews',
    ExpressionAttributeValues: {
      ':placeId': placeId,
    },
    FilterExpression: 'placeId = :placeId',
    ProjectionExpression: 'reviewId, placeId, userName, placeName, beers, bloody, burger, reviewDate, words',
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
 * finds all reviews for user that matches userName
 * 
 * returns {
 *  success: boolean,
 *  reviews: [REVIEW] || null
 *  DBError: ERROR || null
 * }
 * 
 * @param {string} userName 
 * @returns {object[]}
 */
const getReviewsByUserName = async (userName) => {
  const scanCommand = new ScanCommand({
    TableName: 'Reviews',
    ExpressionAttributeValues: {
      ':userName': userName,
    },
    FilterExpression: 'userName = :userName',
    ProjectionExpression: 'reviewId, placeId, userName, placeName, beers, bloody, burger, reviewDate, words',
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
 * deletes review that matches reviewId
 * 
 * returns {
 *  success: boolean,
 *  DBError: ERROR || null
 * }
 * 
 * @param {string} reviewId 
 * @returns {object[]}
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
 * adds review to dynamo
 * returns {
 *  success: boolean,
 *  DBError: ERROR || null
 * }
 * @param {object} user 
 * @returns {object}
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
