const { expect, assert } = require('chai');
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();
const mockReviews = require('../mockDataBase/reviews');
const { SchemaError } = require('../errors/SchemaError');

const { docClient, QueryCommand, ScanCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const { deepCopy } = require('../utils/utils');

describe('reviewsHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('getReviews', () => {
    it('returns reviews', async () => { 
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
      // it('deletes correct review and deletes place', async () => {
      //   const response = await reviewsHandler.deleteReviewByReviewId('review1');
  
      //   expect(response.reviews).to.have.lengthOf(3);
      //   assert.deepEqual(response.reviews[0], mockReviews[1]);
      //   assert.deepEqual(response.reviews[1], mockReviews[2]);
      //   assert.deepEqual(response.reviews[2], mockReviews[3]);
  
  
      //   expect(response.places).to.have.lengthOf(2);
      //   assert.deepEqual(response.places[0], mockPlaces[1]);
      //   assert.deepEqual(response.places[1], mockPlaces[2]);
      // });
    });
    describe('when deleteing a review for a place that has more than 1 review', () => {
      // it('deletes correct review and updates place', async () => {
      //   const response = await reviewsHandler.deleteReviewByReviewId('review2');

      //   expect(response.reviews).to.have.lengthOf(3);
      //   assert.deepEqual(response.reviews[0], mockReviews[0]);
      //   assert.deepEqual(response.reviews[1], mockReviews[2]);
      //   assert.deepEqual(response.reviews[2], mockReviews[3]);

      //   expect(response.places).to.have.lengthOf(3);
      //   assert.deepEqual(response.places[0], mockPlaces[0]);
      //   assert.deepEqual(response.places[2], mockPlaces[2]);
      //   expect(response.places[1].beers).to.equal(3);
      //   expect(response.places[1].benny).to.equal(2);
      //   expect(response.places[1].bloody).to.equal(3);
      //   expect(response.places[1].burger).to.equal(1);
      //   expect(response.places[1].numberOfReviews).to.equal(1);
      // });
    });
    
  });

  describe('addReview', () => {
    describe('when adding a review for a new place', () => {
      // it('adds review and adds place', async () => {
      //   const reviewForNewPlace = {
      //     reviewId: 'review5',
      //     placeId: 'place4',
      //     userName: 'geo',
      //     placeName: 'Royal Tavern',
      //     beers: 1,
      //     benny: 1,
      //     bloody: 1,
      //     burger: 1,
      //     reviewDate: '8/21/2018',
      //     words: 'meh'
      //   };
      //   const response = await reviewsHandler.addReview(reviewForNewPlace);
      //   expect(response.reviews).contains(reviewForNewPlace);
  
      //   expect(response.places[3]).includes({
      //     placeId: 'place4',
      //     placeName: 'Royal Tavern',
      //     beers: 1,
      //     benny: 1,
      //     burger: 1,
      //     bloody: 1,
      //     numberOfReviews: 1,
      //     overallRating: 1
      //   });
      // });
    });

    describe('when adding a review for a preexisting place', () => {
      // it('adds review and updates place', async () => {
      //   const reviewForPreexistingPlace = {
      //     reviewId: 'review5',
      //     placeId: 'place3',
      //     userName: 'geo',
      //     placeName: 'White Dog Cafe',
      //     beers: 1,
      //     benny: 1,
      //     bloody: 1,
      //     burger: 1,
      //     reviewDate: '8/21/2018',
      //     words: 'meh'
      //   };
        
      //   const response = await reviewsHandler.addReview(reviewForPreexistingPlace);
      //   expect(response.reviews).contains(reviewForPreexistingPlace);
  
      //   expect(response.places[2]).includes({
      //     placeId: 'place3',
      //     placeName: 'White Dog Cafe',
      //     beers: 2,
      //     benny: 1,
      //     burger: 3,
      //     bloody: 2,
      //     numberOfReviews: 2,
      //     overallRating: 2
      //   });
      // });
    });
  });
});