const { 
  docClient,
  TransactWriteCommand
} = require('../aws/awsClients');

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

module.exports = {
  transactionAddPlaceAndAddReview,
  transactionUpdatePlaceAndAddReview,
  transactionDeletePlaceAndDeleteReview,
  transactionUpdatePlaceAndDeleteReview
}