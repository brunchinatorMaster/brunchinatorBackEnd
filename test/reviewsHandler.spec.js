const { expect, assert } = require('chai');
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();
const mockReviews = require('../mockDataBase/reviews');

const { docClient, QueryCommand, ScanCommand, DeleteCommand, UpdateCommand, PutCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const { deepCopy } = require('../utils/utils');
const mockPlaces = require('../mockDataBase/places');
const { createNewPlaceFromReview } = require('../utils/placesUtils');
const { addReview } = require('../databaseAccess/reviewsDatabaseAccess');
const { recalculateRatingsForAddingReviewToPlace } = require('../utils/placesUtils');

describe('reviewsHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('getReviews', () => {
    it('returns reviews found by dynamo', async () => { 
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: reviews
      });

      const response = await reviewsHandler.getReviews();
      assert.deepEqual(response, {
        success: true,
        reviews: reviews
      });
    });

    it('returns DBErrorResponse if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviews();

      expect(response).to.be.instanceof(DBErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('getReviewByReviewId', () => {
    it('returns BadSchemaResponse is reviewId is invalid', async () => {
      const response = await reviewsHandler.getReviewByReviewId(12345);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"reviewId" must be a string');
    });

    it('returns review found by dynamo', async () => {
      const review = deepCopy(mockReviews[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [review]
      });
  
      const response = await reviewsHandler.getReviewByReviewId(review.reviewId);

      assert.deepEqual(response, {
        success: true,
        reviewExists: true,
        review,
      });
    });

    it('returns DBErrorResponse if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviewByReviewId('123');

      expect(response).to.be.instanceof(DBErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('getReviewsByPlaceId', () => {
    it('returns BadSchemaResponse is placeId is invalid', async () => {
      const response = await reviewsHandler.getReviewsByPlaceId(12345);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeId" must be a string');
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[1], reviews[2]]
      });
  
      const response = await reviewsHandler.getReviewsByPlaceId('place2');

      assert.deepEqual(response, {
        success: true,
        reviewsExist: true,
        reviews: [reviews[1], reviews[2]],
      });
    });

    it('returns DBErrorResponse if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviewsByPlaceId('123');

      expect(response).to.be.instanceof(DBErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('getReviewsByUserName', () => {
    it('returns BadSchemaResponse is userName is invalid', async () => {
      const response = await reviewsHandler.getReviewsByUserName(123);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[0], reviews[1]]
      });
  
      const response = await reviewsHandler.getReviewsByUserName('geo');

      assert.deepEqual(response, {
        success: true,
        reviewsExist: true,
        reviews: [reviews[0], reviews[1]],
      });
    });

    it('returns DBErrorResponse if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviewsByUserName('123');

      expect(response).to.be.instanceof(DBErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('deleteReviewByReviewId', () => {
    describe('when deleting a review for a place that has only 1 review', () => {
      it('deletes correct review, deletes place, and returns success:true', async () => {
        // call for getReviewByReviewId
        const review = deepCopy(mockReviews[0]);
        ddbMock.on(QueryCommand, {
          TableName: 'Reviews',
          ExpressionAttributeValues: {
            ':reviewId': review.reviewId,
          },
          KeyConditionExpression: 'reviewId = :reviewId',
          ConsistentRead: true,
        }).resolves({
          Items: [review]
        });

        // call for getPlaceByPlaceId
        const place = deepCopy(mockPlaces[0])
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId,
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: [place]
        });

        // call for deleteReviewByReviewId
        ddbMock.on(DeleteCommand, {
          TableName: 'Reviews',
          Key: {
            reviewId: review.reviewId,
          }
        }).resolves({
          success: true,
        });

        // call for deletePlaceByPlaceId
        ddbMock.on(DeleteCommand, {
          TableName: 'Places',
          Key: {
            placeId: place.placeId,
          }
        }).resolves({
          success: true,
        });


        const response = await reviewsHandler.deleteReviewByReviewId(review.reviewId);
        assert.deepEqual(response, { success: true })
      });
    });
    
    describe('when deleteing a review for a place that has more than 1 review', () => {
      it('deletes correct review, updates place, and returns success:true', async () => {
        // call for getReviewByReviewId
      const review = deepCopy(mockReviews[1]);
      ddbMock.on(QueryCommand, {
        TableName: 'Reviews',
        ExpressionAttributeValues: {
          ':reviewId': review.reviewId,
        },
        KeyConditionExpression: 'reviewId = :reviewId',
        ConsistentRead: true,
      }).resolves({
        Items: [review]
      });

      // call for getPlaceByPlaceId
      const place = deepCopy(mockPlaces[1])
      ddbMock.on(QueryCommand, {
        TableName: 'Places',
        ExpressionAttributeValues: {
          ':placeId': review.placeId,
        },
        KeyConditionExpression: 'placeId = :placeId',
        ConsistentRead: true,
      }).resolves({
        Items: [place]
      });

      // call for deleteReviewByReviewId
      ddbMock.on(DeleteCommand, {
        TableName: 'Reviews',
        Key: {
          reviewId: review.reviewId,
        }
      }).resolves({
        success: true,
      });

      // call for updatePlace
      ddbMock.on(UpdateCommand, {
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
      }).resolves({
        Attributes: place,
      });

      const response = await reviewsHandler.deleteReviewByReviewId(review.reviewId);
      assert.deepEqual(response, { success: true })
      });
    });
  });

  describe('addReview', () => {
    describe('when adding a review for a new place', () => {
     it('adds review, adds place, and returns success message', async () => {
      const review = deepCopy(mockReviews[0]);
      delete review.reviewId;

      // call for getPlaceByPlaceId
      ddbMock.on(QueryCommand, {
        TableName: 'Places',
        ExpressionAttributeValues: {
          ':placeId': review.placeId,
        },
        KeyConditionExpression: 'placeId = :placeId',
        ConsistentRead: true,
      }).resolves({
        Items: []
      });

      // call for addPlace
      const place = createNewPlaceFromReview(review);
      ddbMock.on(PutCommand, {
        TableName: 'Places',
        Item: place 
      }).resolves({
        not: 'an error'
      });

      // call for addReview
      ddbMock.on(PutCommand, {
        TableName: 'Reviews',
        Item: review  
      }).resolves({
        not: 'an error'
      });

      const response = await reviewsHandler.addReview(review);

      assert.deepEqual(response, {
        placeResponse: {
          success: true,
          DBError: undefined,
        },
        addReviewResponse: {
          success: true,
          DBError: undefined,
        }
      });
     });
    });

    describe('when adding a review for a preexisting place', () => {
      it('adds review, updates place, and returns success message', async () => {
        const review = deepCopy(mockReviews[0]);
        delete review.reviewId;
        const place = deepCopy(mockPlaces[0]);
        const toUpdate = recalculateRatingsForAddingReviewToPlace(review, place);
        toUpdate.numberOfReviews++; 

        // call for getPlaceByPlaceId
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId,
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: [place]
        });
  
        // call for updatePlace
        ddbMock.on(UpdateCommand, {
          TableName: 'Places',
          Key: {
            placeId: toUpdate.placeId,
            placeName: toUpdate.placeName,
          },
          UpdateExpression: 'set beers = :beers, bloody = :bloody, burger = :burger, benny = :benny, numberOfReviews = :numberOfReviews, overallRating = :overallRating',
          ExpressionAttributeValues: {
            ":beers": toUpdate.beers,
            ":bloody": toUpdate.bloody,
            ":burger": toUpdate.burger,
            ":benny": toUpdate.benny,
            ":numberOfReviews": toUpdate.numberOfReviews,
            ":overallRating": toUpdate.overallRating,
          },
          ReturnValues: "ALL_NEW",
        }).resolves({
          Attributes: place,
        });
  
        // call for addReview
        ddbMock.on(PutCommand, {
          TableName: 'Reviews',
          Item: review  
        }).resolves({
          not: 'an error'
        });
  
        const response = await reviewsHandler.addReview(review);
  
        assert.deepEqual(response, {
          placeResponse: {
            success: true,
            place: place,
            DBError: undefined,
          },
          addReviewResponse: {
            success: true,
            DBError: undefined,
          }
        });
       });
    });
  });
});