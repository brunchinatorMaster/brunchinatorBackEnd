const { 
  docClient,
  TransactWriteCommand
} = require('../aws/awsClients');

/**
 * adds place and adds review in dynamo
 * as an all or nothing transaction
 * 
 * returns {
 *  success: boolean,
 *  DBError: ERROR || null
 * }
 * 
 * @param {object} place 
 * @param {object} review 
 * @returns {object}
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
 * updates place and adds review in dynamo
 * as an all or nothing transaction
 * 
 * returns {
 *  success: boolean,
 *  DBError: ERROR || null
 * }
 * 
 * @param {object} place 
 * @param {object} review 
 * @returns {object}
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
 * deletes place and deletes review in dynamo
 * as an all or nothing transaction
 * 
 * returns {
 *  success: boolean,
 *  DBError: ERROR || null
 * }
 * 
 * @param {string} placeId 
 * @param {string} placeName
 * @param {string} reviewId 
 * @returns {object}
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
 * updates place and deletes review in dynamo
 * as an all or nothing transaction
 * 
 * returns {
 *  success: boolean,
 *  DBError: ERROR || null
 * }
 * 
 * @param {object} place 
 * @param {string} reviewId 
 * @returns {object}
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
 * updates place and updates review in dynamo
 * as an all or nothing transaction
 * 
 * returns {
 *  success: boolean,
 *  DBError: ERROR || null
 * }
 * 
 * @param {object} place 
 * @param {object} review
 * @returns {object}
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